import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fb, InstanceDb, Ob} from "#pou";

import {BuildSource, Provider} from "#source";
import {UnitBlock, UnitTest} from "#unit";
import {Bool, Int} from "#primitives";
import {UnitTestStatus} from "@vifjs/sim-node";
import {Assign, Call, Compare} from "#basics";
import {If} from "@vifjs/language-builder/operations/program-control";

const TestProgram = () => {
    const fb = new Fb({
        interface: {
            static: {
                counter_instance: Provider.internal.CTUInstance.self(),
                counter_up: new Bool(),
                counter_reset: new Bool(),
                counter_value: new Int(0),
                counter_output: new Bool(),
            }
        },
        body() {
            return [
                Provider.internal.CTU.use(this.static.counter_instance, {
                    input: {
                        CU: this.static.counter_up,
                        RESET: this.static.counter_reset,
                        PV: new Int(5),
                    },
                    output: {
                        CV: this.static.counter_value,
                        Q: this.static.counter_output,
                    }
                }),

                // Revert the CU bool on each cycle
                new If(new Compare(this.static.counter_up, "=", true))
                    .then([new Assign(this.static.counter_up, false)])
                    .else([new Assign(this.static.counter_up, true)]),

                new UnitBlock("Trigger when Counter value is 5",
                    new If(new Compare(this.static.counter_value, "=", new Int(5)))
                        .then([
                            new UnitTest("[When Counter reached] Counter value should be 5", this.static.counter_value, "=", new Int(5)),
                            new UnitTest("[When Counter reached] Counter Q should be true", this.static.counter_output, "=", true),
                        ])
                ),

                new UnitBlock("Trigger when Counter reset is true",
                    new If(new Compare(this.static.counter_reset, "=", true))
                        .then([
                            new UnitTest("[When Counter reset] Counter value should be 0", this.static.counter_value, "=", 0),
                            new UnitTest("[When Counter reset] Counter Q should be false", this.static.counter_output, "=", false),
                        ])
                ),

                // Force the counter to true
                new If(new Compare(this.static.counter_output, "=", true))
                    .then([new Assign(this.static.counter_reset, true)])


            ]
        }
    })

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
                "Ctu_Fb": fb,
                "Ctu_Fb_Instance": fbInstance
            }
    })
}

describe("Simulation primitives", async () => {
    describe("Assign Values += 8", async () => {
        describe("Simulation tests", async () => {
            const container = new Container()
            await container.boot()
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
                    expect(output["file:///Ctu_Fb"]).to.toMatchObject([
                        "FUNCTION_BLOCK \"Ctu_Fb\"",

                        "	VAR",
                        "		counter_instance : CTU;",
                        "		counter_up : Bool;",
                        "		counter_reset : Bool;",
                        "		counter_value : Int;",
                        "		counter_output : Bool;",
                        "	END_VAR",
                        "BEGIN",
                        "	counter_instance(",
                        "		CU := counter_up,",
                        "		RESET := counter_reset,",
                        "		PV := 5,",
                        "		CV => counter_value,",
                        "		Q => counter_output",
                        "	);",
                        "	IF counter_up = true THEN",
                        "		counter_up := false;",
                        "	ELSE",
                        "		counter_up := true;",
                        "	;",
                        "	END_IF;",
                        "	IF counter_output = true THEN",
                        "		counter_reset := true;",
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
