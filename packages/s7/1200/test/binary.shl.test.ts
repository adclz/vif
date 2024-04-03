import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fb, InstanceDb, Ob} from "#pou";

import {BuildSource, Provider} from "#source";
import {UnitTest} from "#unit";
import {Byte, DWord, Word} from "#primitives";
import {UnitTestStatus} from "@vifjs/sim-node";
import {Assign, Call} from "#basics";
import {Shl} from "#binary";

const TestProgram = () => {
    const fb = new Fb({
        interface: {
            temp: {
                test_byte: new Byte(8),
                test_word: new Word(8),
                test_dword: new DWord(8)
            }
        },
        body() {
            return [
                new Assign(this.temp.test_byte, new Shl(new Byte(8), new Byte(2))),
                new UnitTest("Byte shl", this.temp.test_byte, "=", 32),

                new Assign(this.temp.test_word, new Shl(new Word(8), new Word(2))),
                new UnitTest("Word shl", this.temp.test_word, "=", 32),
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
                "Shl_Fb": fb,
                "Shl_Fb_Instance": fbInstance
            }
    })
}
describe("Simulation primitives", async () => {
    describe("Assign Values += 8", async () => {
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
                    expect(output["file:///Shl_Fb"]).to.toMatchObject([
                        "FUNCTION_BLOCK \"Shl_Fb\"",
                        "{ S7_Optimized_Access := 'TRUE' }",
                        "VERSION : 0.1",
                        "	VAR_TEMP",
                        "		test_byte : Byte := 16#8;",
                        "		test_word : Word := 16#8;",
                        "		test_dword : DWord := 16#8;",
                        "	END_VAR",
                        "BEGIN",
                        "	#test_byte := SHL(IN := BYTE#16#8, N := 16#2);",
                        "	#test_word := SHL(IN := WORD#16#8, N := 16#2);",
                        "",
                        "END_FUNCTION_BLOCK"
                    ])
                })
            })
        })
    })
})
