import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fb, InstanceDb, Ob} from "#pou";

import {BuildSource, Provider} from "#source";
import {UnitTest} from "#unit";
import {Assign, Call, Compare} from "#basics";
import {Bool, Int} from "#primitives";
import {UnitTestStatus} from "@vifjs/sim-node";
import {If} from "@vifjs/language-builder/operations/program-control";

const TestProgram = () => {
    const fb = new Fb({
            interface: {
                temp: {
                    test_bool: new Bool(),
                    test_int: new Int(5)
                }
            },
            body() {
                return [
                    new If(new Compare(this.temp.test_bool, "=", false))
                        .then([
                            new Assign(this.temp.test_bool, true)
                        ]),
                    new UnitTest("[Equal] Bool should be equal true", this.temp.test_bool, "=", true),
                    new If(new Compare(this.temp.test_int, ">", 2))
                        .then([
                            new Assign(this.temp.test_int, -5)
                        ]),
                    new UnitTest("[Greater] Int should be equal -5", this.temp.test_int, "=", -5),
                    new If(new Compare(this.temp.test_int, "<", 0))
                        .then([
                            new Assign(this.temp.test_int, 5)
                        ]),
                    new UnitTest("[Lesser] Int should be equal 5", this.temp.test_int, "=", 5),
                    new If(new Compare(this.temp.test_int, ">=", 5))
                        .then([
                            new Assign(this.temp.test_int, 0)
                        ]),
                    new UnitTest("[GreaterOrEqual] Int should be equal 0", this.temp.test_int, "=", 0),
                    new If(new Compare(this.temp.test_int, ">=", 0))
                        .then([
                            new Assign(this.temp.test_int, 5)
                        ]),
                    new UnitTest("[LesserOrEqual] Int should be equal 5", this.temp.test_int, "=", 5),

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
                "If_Fb": fb,
                "If_Fb_Instance": fbInstance
            }
    })
}

describe("Simulation primitives", async () => {
    describe("Check If", async () => {
        describe("Simulation tests", async () => {
            const container = new Container()
            await container.boot()
            const plugin = new Plugin("vitest", 200)
            plugin.on("messages", messages => {
                messages.forEach(x => console.log(x))
            })

            plugin.on("warnings", warnings => {
                console.log(warnings)
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
                    const test = Object.values(output).map(x => x.join("\n")).join("\n")
                    console.log(test)
                    expect(output["file:///If_Fb"]).to.toMatchObject(
                        [
                            "FUNCTION_BLOCK \"If_Fb\"",
                            "{ S7_Optimized_Access := 'TRUE' }",
                            "VERSION : 0.1",
                            "	VAR_TEMP",
                            "		test_bool : Bool;",
                            "		test_int : Int := 5;",
                            "	END_VAR",
                            "BEGIN",
                            "	IF #test_bool = false THEN",
                            "		#test_bool := true;",
                            "	;",
                            "	END_IF;",
                            "	IF #test_int > 2 THEN",
                            "		#test_int := -5;",
                            "	;",
                            "	END_IF;",
                            "	IF #test_int < 0 THEN",
                            "		#test_int := 5;",
                            "	;",
                            "	END_IF;",
                            "	IF #test_int >= 5 THEN",
                            "		#test_int := 0;",
                            "	;",
                            "	END_IF;",
                            "	IF #test_int >= 0 THEN",
                            "		#test_int := 5;",
                            "	;",
                            "	END_IF;",
                            "",
                            "END_FUNCTION_BLOCK"
                        ]
                    )
                })
            })
        })
    })
})
