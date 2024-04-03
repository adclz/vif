import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fc, Ob, GlobalDb, Udt} from "#pou";
import {BuildSource, Provider} from "#source";
import {Assign, Call} from "#basics";
import {UnitTestStatus} from "@vifjs/sim-node";
import {Bool, Int} from "#primitives";
import {Struct} from "#complex";
import {UnitTest} from "#unit";

const TestProgram = () => {
    const MyUdt = new Udt({
        test: new Bool(),
        nested: new Struct({
            test2: new Int()
        })
    })

    const GlobalDbUdt = new GlobalDb(MyUdt)
    
    const fc = new Fc({
        body() {
            return [
                new Assign(GlobalDbUdt.static.nested.test2, 5)
            ]
        },
    })

    return BuildSource({
        blocks:
            {
                "Main": new Ob(
                    {
                        body() {
                            return [
                                new Call(fc, {}),
                                new UnitTest("GlobalDb of Udt should have nested.test2 to 5", GlobalDbUdt.static.nested.test2, "=", 5)
                            ]
                        }
                    }
                ),
                "Test_Fc": fc,
                "GlobalDbUdt": GlobalDbUdt,
                "MyUdt": MyUdt
            },
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
                    expect(output["file:///GlobalDbUdt"]).to.toMatchObject([
                        "DATA_BLOCK \"GlobalDbUdt\"",
                        "{ S7_Optimized_Access := 'TRUE' }",
                        "VERSION : 0.1",
                        "	VAR",
                        "		test : Bool;",
                        "		nested : Struct",
                        "			test2 : Int;",
                        "		END_STRUCT;",
                        "	END_VAR",
                        "",
                        "BEGIN",
                        "",
                        "END_DATA_BLOCK",
                        "",
                    ])
                })
            })
        })
    })
})

