import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fb, InstanceDb, Ob} from "#pou";

import {BuildSource, Provider} from "#source";
import {UnitBlock, UnitTest} from "#unit";
import {Bool, Time, Time_from} from "#primitives";
import {UnitTestStatus} from "@vifjs/sim-node";
import {Assign, Call, Compare} from "#basics";
import {Instance} from "#complex";
import {If} from "@vifjs/language-builder/operations/program-control";

const TestProgram = () => {
    const fb = new Fb({
            interface: {
                static: {
                    immediate_start: new Bool(true),
                    ton_pt: Time_from({s: 5}),
                    ton_et: new Time(),
                    ton_q: new Bool(),
                    f_trig: new Bool(),
                    timer_instance: Provider.internal.IEC_TIMER.self(),
                    f_trig_instance: new Instance(Provider.internal.R_TRIG, {}),
                }
            },
            body() {
                return [
                    Provider.internal.TON.use(this.static.timer_instance, {
                        input: {
                            IN: this.static.immediate_start,
                            PT: Time_from({s: 5}),
                        },
                        output: {
                            ET: this.static.ton_et,
                            Q: this.static.ton_q,
                        },
                    }),

                    new UnitBlock("Trigger once TON has elapsed (Q)",
                        new If(new Compare(this.static.ton_q, "=", true))
                            .then([
                                new UnitTest("[When TON elapsed] PT should be 5s", this.static.ton_pt, "=", Time_from({s: 5})),
                                new UnitTest("[When TON elapsed] ET should be 5s", this.static.ton_et, "=", Time_from({s: 5})),
                                new UnitTest("[When TON elapsed] Q should be true", this.static.ton_q, "=", true)
                            ])
                    ),

                    new UnitBlock("Trigger once TON reset (By Rising Edge)",
                        new If(new Compare(this.static.immediate_start, "=", false))
                            .then([
                                new UnitTest("[When TON reset] PT should be 5s", this.static.ton_pt, "=", Time_from({s: 5})),
                                new UnitTest("[When TON reset] ET should be 0s", this.static.ton_et, "=", Time_from({s: 0})),
                                new UnitTest("[When TON reset] Q should be false", this.static.ton_q, "=", false)
                            ])
                    ),

                    // Reset IN so TON should be back at default
                    new If(new Compare(this.static.ton_q, "=", true))
                        .then([new Assign(this.static.immediate_start, false)]),
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
                "Ton_Fb": fb,
                "Ton_Fb_Instance": fbInstance
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

            const plugin = new Plugin("vitest", 200)
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
                    expect(output["file:///Ton_Fb"]).to.toMatchObject([
                        "FUNCTION_BLOCK \"Ton_Fb\"",
                        "{ S7_Optimized_Access := 'TRUE' }",
                        "VERSION : 0.1",
                        "	VAR",
                        "		immediate_start : Bool := true;",
                        "		ton_pt : Time := T#5S;",
                        "		ton_et : Time;",
                        "		ton_q : Bool;",
                        "		f_trig : Bool;",
                        "		timer_instance {InstructionName := 'IEC_TIMER'; LibVersion := '1.0'; S7_SetPoint := 'False'} : IEC_TIMER",
                        "		f_trig_instance {InstructionName := 'R_TRIG'; LibVersion := '1.0';} : R_TRIG",
                        "	END_VAR",
                        "BEGIN",
                        "	#timer_instance.TON(",
                        "		IN := #immediate_start,",
                        "		PT := T#5S,",
                        "		ET => #ton_et,",
                        "		Q => #ton_q",
                        "	);",
                        "	IF #ton_q = true THEN",
                        "		#immediate_start := false;",
                        "	;",
                        "	END_IF;",
                        "",
                        "END_FUNCTION_BLOCK"
                    ])
                })
            })
        }, {timeout: 6000})
    })
})
