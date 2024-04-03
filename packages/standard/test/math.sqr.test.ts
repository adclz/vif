﻿import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fb, InstanceDb, Ob} from "#pou";

import {BuildSource, Provider} from "#source";
import {UnitTest} from "#unit";
import {Assign, Call} from "#basics";
import {LReal, Real} from "#primitives";
import {UnitTestStatus} from "@vifjs/sim-web";
import {Sqr} from "#math";

const TestProgram = () => {
    const fb = new Fb({
            interface: {
                temp: {
                    test_real: new Real(),
                    test_lreal: new LReal(),
                }
            },
            body() {
                return [
                    new Assign(this.temp.test_real, new Sqr(new Real(0.9))),
                    new UnitTest("Real Sqr approx", this.temp.test_real, ">=", 0.8000009),
                    new UnitTest("Real Sqr approx", this.temp.test_real, "<=", 0.8100001),

                    new Assign(this.temp.test_lreal, new Sqr(new LReal(0.9))),
                    new UnitTest("LReal Sqr approx", this.temp.test_lreal, ">=", 0.800000000000009),
                    new UnitTest("LReal Sqr approx", this.temp.test_lreal, "<=", 0.810000000000001),
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
                "Sqr_Fb": fb,
                "Sqr_Fb_Instance": fbInstance
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
                    console.log(JSON.stringify(Provider.toAst()))
                    expect(test.status, test.fail_message + "\n")
                        .to.be.equal(UnitTestStatus.Succeed)
                })
            })
            describe("Compiler output", () => {
                const output = program.compileProgram()
                it("output", () => {
                    Object.values(output)
                        .forEach(x => console.log(x.join("\n")))
                    expect(output["file:///Sqr_Fb"]).to.toMatchObject([
                        "FUNCTION_BLOCK \"Sqr_Fb\"",

                        "	VAR_TEMP",
                        "		test_real : Real;",
                        "		test_lreal : LReal;",
                        "	END_VAR",
                        "BEGIN",
                        "	test_real := SQR(0.9);",
                        "	test_lreal := SQR(0.9);",
                        "",
                        "END_FUNCTION_BLOCK"
                    ])
                })
            })
        })
    })
})

