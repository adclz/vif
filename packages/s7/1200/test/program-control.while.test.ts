import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fb, InstanceDb, Ob} from "#pou";

import {BuildSource, Provider} from "#source";
import {UnitTest} from "#unit";
import {Assign, Calc, Call, Compare} from "#basics";
import {Int} from "#primitives";
import {UnitTestStatus} from "@vifjs/sim-node";
import {While} from "#program-control";

const TestProgram = () => {
    const fb = new Fb({
            interface: {
                temp: {
                    i: new Int(),
                    for_end: new Int(5),
                    increment: new Int()
                }
            }, body() {
                return [
                    new While(new Compare(this.temp.i, "<", 5))
                        .do([
                            new Assign(this.temp.increment, new Calc(this.temp.increment, "+", 1)),
                            new Assign(this.temp.i, new Calc(this.temp.i, "+", 1))
                        ]),
                    new UnitTest("While i < 5", this.temp.increment, "=", 5),
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
                "While_Fb": fb,
                "While_Fb_Instance": fbInstance
            }
    })
}

describe("Simulation primitives", async () => {
    describe("While", async () => {
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
                const test = Object.values(output).map(x => x.join("\n")).join("\n")
                console.log(test)
                expect(output["file:///While_Fb"]).to.toMatchObject(
                    [
                        "FUNCTION_BLOCK \"While_Fb\"",
                        "{ S7_Optimized_Access := 'TRUE' }",
                        "VERSION : 0.1",
                        "	VAR_TEMP",
                        "		i : Int;",
                        "		for_end : Int := 5;",
                        "		increment : Int;",
                        "	END_VAR",
                        "BEGIN",
                        "	WHILE #i < 5 DO",
                        "		#increment := #increment + 1;",
                        "		#i := #i + 1;",
                        "	;",
                        "	END_WHILE;",
                        "",
                        "END_FUNCTION_BLOCK"
                    ]
                )
            })
        })
    })
})
