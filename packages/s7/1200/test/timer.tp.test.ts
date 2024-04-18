import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fb, InstanceDb, Ob} from "#pou";
import {BuildSource, Provider} from "@/src/source";
import {UnitBlock, UnitTest} from "#unit";
import {Bool, Time, Time_from} from "#primitives";
import {UnitTestStatus} from "@vifjs/sim-node";
import {Call, Compare} from "#basics";
import {Instance} from "#complex";
import {If} from "@vifjs/language-builder/operations/program-control";

const TestProgram = () => {
    const fb = new Fb({
            interface: {
                static: {
                    trigger_timer: new Bool(true),
                    tp_pt: Time_from({s: 5}),
                    tp_et: new Time(),
                    tp_q: new Bool(),
                    f_trig: new Bool(),
                    timer_instance: Provider.internal.IEC_TIMER.self(),
                    f_trig_instance: new Instance(Provider.internal.F_TRIG, {}),
                },
            },
            body() {
                return [
                    Provider.internal.TP.use(this.static.timer_instance, {
                        input: {
                            IN: this.static.trigger_timer,
                            PT: Time_from({s: 5}),
                        },
                        output: {
                            ET: this.static.tp_et,
                            Q: this.static.tp_q,
                        }
                    }),

                    new Call(this.static.f_trig_instance, {
                        input: {
                            CLK: this.static.tp_q
                        },
                        output: {
                            Q: this.static.f_trig
                        }
                    }),

                    new UnitBlock("Trigger when falling edge of TP",
                        new If(new Compare(this.static.f_trig, "=", true))
                            .then([
                                new UnitTest("[When TP elapsed] PT should be 5s", this.static.tp_pt, "=", Time_from({s: 5})),
                                new UnitTest("[When TP elapsed] ET should be 0s", this.static.tp_et, "=", Time_from({s: 0})),
                                new UnitTest("[When TP elapsed] Q should be false", this.static.tp_q, "=", false)
                            ])
                    ),
                ]
            }
        }
    )

    const fbInstance = new InstanceDb(fb)

    return BuildSource({
        blocks:
            {
                "Main": new Ob(
                    {
                        body() {
                            return [new Call(fbInstance, {})]
                        }
                    }
                ),
                "Tp_Fb": fb,
                "Tp_Fb_Instance": fbInstance
            }
    })
}

describe("Simulation primitives", async () => {
    describe("Assign Values += 8", async () => {
        describe("Simulation tests", async () => {
            const container = new Container()
            await container.boot()
            container.loadContainerParams({
                stopAfter: 6000
            })
            const plugin = new Plugin("vitest", 50)

            plugin.on("messages", messages => {
                messages.forEach(x => console.log(x))
            })

            plugin.on("warnings", warnings => {
                console.log(warnings)
            })

            plugin.on("error", warnings => {
                console.error(warnings)
            })

            const getExecutor = await plugin.getAsyncExecutor().init(container)

            const program = TestProgram()

            await getExecutor.loadProvider(Provider.toAst());
            await getExecutor.loadProgram(program.toAst());
            const tests = await getExecutor.startAndWaitUnitTests("Main")
            tests.forEach(test => {
                it(test.description, () => {
                    expect(test.status, test.fail_message + "\n")
                        .to.be.equal(UnitTestStatus.Succeed)
                })
            })
            describe("Compiler output", () => {
                const output = program.compileProgram()
                it("output", () => {
                    Object.values(output)
                        .forEach(x => console.log(x.join("\n")))
                    expect(output["file:///Tp_Fb"]).to.toMatchObject([
                        "FUNCTION_BLOCK \"Tp_Fb\"",
                        "{ S7_Optimized_Access := 'TRUE' }",
                        "VERSION : 0.1",
                        "	VAR",
                        "		trigger_timer : Bool := true;",
                        "		tp_pt : Time := T#5S;",
                        "		tp_et : Time;",
                        "		tp_q : Bool;",
                        "		f_trig : Bool;",
                        "		timer_instance {InstructionName := 'IEC_TIMER'; LibVersion := '1.0'; S7_SetPoint := 'False'} : IEC_TIMER",
                        "		f_trig_instance {InstructionName := 'F_TRIG'; LibVersion := '1.0';} : F_TRIG",
                        "	END_VAR",
                        "BEGIN",
                        "	#timer_instance.TP(",
                        "		IN := #trigger_timer,",
                        "		PT := T#5S,",
                        "		ET => #tp_et,",
                        "		Q => #tp_q",
                        "	);",
                        "	#f_trig_instance(",
                        "		CLK := #tp_q,",
                        "		Q => #f_trig",
                        "	);",
                        "",
                        "END_FUNCTION_BLOCK"
                    ])
                })
            })
        }, {timeout: 6000})
    })
})
