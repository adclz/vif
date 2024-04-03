import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fc, Ob} from "#pou";
import {BuildSource, Provider} from "#source";
import {Assign, Call} from "@vifjs/language-builder/operations/basics";
import {UnitTestStatus} from "@vifjs/sim-node";
import {Bool} from "#primitives";
import {UnitTest} from "#unit";
import {Struct} from "#complex";

const TestProgram = () => {
    const fc = new Fc({
        interface: {
            inout: {
                "ABool": new Bool(),
                "InitialStruct": new Struct({
                    test: new Bool()
                })
            }
        },
        body() {
            return [
                new Assign(this.inout.ABool, true),
                new Assign(this.inout.InitialStruct.test, true),
            ]
        },
    })
    
    return BuildSource({
        blocks: {
                "Main": new Ob({
                    interface: {
                        temp: {
                            "InitialBool": new Bool(),
                            "InitialStruct": new Struct({
                                test: new Bool()
                            })
                        },
                        constant: {
                            test2: new Bool()
                        }
                    },
                    body() {
                            return [
                                new UnitTest("Ping Bool", this.temp.InitialBool, "=", false),
                                new UnitTest("Ping Bool inside Struct", this.temp.InitialStruct.test, "=", false),
                                new Call(fc, {
                                    inout:  {   
                                        "ABool": this.temp.InitialBool,
                                        "InitialStruct": this.temp.InitialStruct
                                    }
                                }),
                                new UnitTest("Pong Bool", this.temp.InitialBool, "=", true),
                                new UnitTest("Pong Bool inside Struct", this.temp.InitialStruct.test, "=", true)
                            ]
                        }
                    }
                ),
                "Test_Fc": fc
            }
    })
}

describe("Simulation primitives", async () => {
    describe("Sqr_Fb Values", async () => {
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
                    Object.values(output)
                        .forEach(x => console.log(x.join("\n")))
                    expect(output["file:///Test_Fc"]).to.toMatchObject([
                        "FUNCTION \"Test_Fc\" : Void",
                        "{ S7_Optimized_Access := 'TRUE' }",
                        "VERSION : 0.1",
                        "	VAR_IN_OUT",
                        "		ABool : Bool;",
                        "		InitialStruct : Struct",
                        "			test : Bool;",
                        "		END_STRUCT;",
                        "	END_VAR",
                        "BEGIN",
                        "	#ABool := true;",
                        "	#InitialStruct.test := true;",
                        "",
                        "END_FUNCTION"
                    ])
                })
            })
        })
    })
})

