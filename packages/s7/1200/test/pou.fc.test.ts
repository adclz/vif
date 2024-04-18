import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fc, Ob} from "#pou";
import {BuildSource, Provider} from "#source";
import {Call} from "@vifjs/language-builder/operations/basics";
import {UnitTestStatus} from "@vifjs/sim-node";
import {Bool} from "#primitives";
import {UnitTest} from "#unit";

const TestProgram = () => {
    const fc = new Fc({
        interface: {
            input: {
                "ABool": new Bool()
            }
        },
        body() {
            return [
                new UnitTest("Should be true", this.input.ABool, "=", true)
            ]
        },
    })

    return BuildSource({
        blocks:
            {
                "Main": new Ob(
                    {
                        body() {
                            return [new Call(fc, {
                                input: {
                                    "ABool": true
                                }
                            })]
                        }
                    }
                ),
                "Test_Fc": fc,
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
                        "	VAR_INPUT",
                        "		ABool : Bool;",
                        "	END_VAR",
                        "BEGIN",
                        "",
                        "END_FUNCTION"
                    ])
                })
            })
        })
    })
})

