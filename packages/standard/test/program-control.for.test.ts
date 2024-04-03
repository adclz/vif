import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fb, InstanceDb, Ob} from "#pou";

import {BuildSource, Provider} from "#source";
import {UnitTest} from "#unit";
import {Assign, Calc, Call} from "#basics";
import {Int} from "#primitives";
import {UnitTestStatus} from "@vifjs/sim-web";
import {ForOf} from "@vifjs/language-builder/operations/program-control";


const TestProgram = () => {
    const fb = new Fb({
            interface: {
                temp: {
                    i: new Int(),
                    for_end: new Int(5),
                    increment: new Int()
                }
            },
            body() {
                return [
                    new ForOf(this.temp.i, 5, 10, 1)
                        .do([
                            new Assign(this.temp.increment, new Calc(this.temp.increment, "+", 1))
                        ]),
                    new UnitTest("For i := 5 to 10 by 1 ", this.temp.increment, "=", 5),
                    new Assign(this.temp.increment, 0),
                    new ForOf(this.temp.i, 5, 10)
                        .do([
                            new Assign(this.temp.i, new Calc(this.temp.i, "+", 1)),
                            new Assign(this.temp.increment, new Calc(this.temp.increment, "+", 1))
                        ]),
                    new UnitTest("For i := 5 to 10", this.temp.for_end, "=", 5)
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
                "For_Fb": fb,
                "For_Fb_Instance": fbInstance
            }
    })
}

describe("Simulation primitives", async () => {
    describe("ForOf loop", async () => {
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

        describe("Simulation tests", async () => {
            await getExecutor.loadProvider(Provider.toAst());
            await getExecutor.loadProgram(program.toAst());
            const tests = await getExecutor.startAndWaitUnitTests("Main")
            tests.forEach(test => {
                it(test.description, () => {
                    expect(test.status, test.fail_message + "\n")
                        .to.be.equal(UnitTestStatus.Succeed)
                })
            })
        })
        describe("Compiler output", () => {
            const output = program.compileProgram()

            it("output", () => {
                Object.values(output)
                    .forEach(x => console.log(x.join("\n")))
                expect(output["file:///For_Fb"]).to.toMatchObject(
                    [
                        "FUNCTION_BLOCK \"For_Fb\"",

                        "\tVAR_TEMP",
                        "\t\ti : Int;",
                        "\t\tfor_end : Int := 5;",
                        "\t\tincrement : Int;",
                        "\tEND_VAR",
                        "BEGIN",
                        "\tFOR i := 5 TO 10 BY 1 DO",
                        "\t\tincrement := increment + 1;",
                        "\t;",
                        "\tEND_FOR;",
                        "\tincrement := 0;",
                        "\tFOR i := 5 TO 10 DO",
                        "\t\ti := i + 1;",
                        "\t\tincrement := increment + 1;",
                        "\t;",
                        "\tEND_FOR;",
                        "",
                        "END_FUNCTION_BLOCK"
                    ]
                )
            })
        })
    })
})
