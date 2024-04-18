import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fb, InstanceDb, Ob} from "#pou";

import {BuildSource, Provider} from "#source";
import {UnitTest} from "#unit";
import {Assign, Call} from "#basics";
import {Byte, DWord, LWord, Word} from "#primitives";
import {UnitTestStatus} from "@vifjs/sim-node";
import {Swap} from "#binary";

const TestProgram = () => {
    const fb = new Fb({
        interface: {
            temp: {
                test_byte: new Byte(8),
                test_word: new Word(8),
                test_dword: new DWord(8),
                test_lword: new LWord(8),
            }
        },
        body() {
            return [
                new Assign(this.temp.test_byte, new Swap(new Byte(8))),
                new UnitTest("Byte swap", this.temp.test_byte, "=", 8),

                new Assign(this.temp.test_word, new Swap(new Word(8))),
                new UnitTest("Word swap", this.temp.test_word, "=", 2048),
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
                "Swap_Fb": fb,
                "Swap_Fb_Instance": fbInstance
            }
    })
}

describe("Simulation primitives", async () => {
    describe("Swap Binaries", async () => {
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
                    expect(output["file:///Swap_Fb"]).to.toMatchObject([
                        "FUNCTION_BLOCK \"Swap_Fb\"",
                        "{ S7_Optimized_Access := 'TRUE' }",
                        "VERSION : 0.1",
                        "	VAR_TEMP",
                        "		test_byte : Byte := 16#8;",
                        "		test_word : Word := 16#8;",
                        "		test_dword : DWord := 16#8;",
                        "		test_lword : LWord := 16#8;",
                        "	END_VAR",
                        "BEGIN",
                        "	#test_byte := SWAP(16#8);",
                        "	#test_word := SWAP(16#8);",
                        "",
                        "END_FUNCTION_BLOCK"
                    ])
                })
            })
        })
    })
})
