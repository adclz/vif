import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fb, InstanceDb, Ob} from "#pou";
import {BuildSource, Provider} from "#source";
import {UnitTest} from "#unit";
import {Byte,} from "#primitives";
import {UnitTestStatus} from "@vifjs/sim-node";
import {Assign, Call} from "#basics";

const TestProgram = () => {
    const fb = new Fb({
            interface: {
                temp: {
                    test_byte: new Byte(),
                }
            },
            body() {
                return [
                    new UnitTest("Byte [0] false", this.temp.test_byte.getBit(0), "=", false),
                    new UnitTest("Byte [1] false", this.temp.test_byte.getBit(1), "=", false),
                    new UnitTest("Byte [2] false", this.temp.test_byte.getBit(2), "=", false),
                    new UnitTest("Byte [3] false", this.temp.test_byte.getBit(3), "=", false),
                    new UnitTest("Byte [4] false", this.temp.test_byte.getBit(4), "=", false),
                    new UnitTest("Byte [5] false", this.temp.test_byte.getBit(5), "=", false),
                    new UnitTest("Byte [6] false", this.temp.test_byte.getBit(6), "=", false),
                    new UnitTest("Byte [7] false", this.temp.test_byte.getBit(7), "=", false),

                    new Assign(this.temp.test_byte.getBit(0), true),
                    new UnitTest("Byte [0] true", this.temp.test_byte.getBit(0), "=", true),
                    new Assign(this.temp.test_byte.getBit(5), true),
                    new UnitTest("Byte [5] true", this.temp.test_byte.getBit(5), "=", true),

                    new UnitTest("Byte [Big endian] should be 10000100", this.temp.test_byte, "=", 0b100001),

                ]
            }
        }
    )

    const fbInstance = new InstanceDb(fb)

    return BuildSource({
        blocks: {
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
                        "	VAR_TEMP",
                        "		test_byte : Byte;",
                        "	END_VAR",
                        "BEGIN",
                        "	test_byte.0 := true;",
                        "	test_byte.5 := true;",
                        "",
                        "END_FUNCTION_BLOCK"
                    ])
                })
            })
        })
    })
})
