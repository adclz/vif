import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fb, Ob} from "#pou";
import {BuildSource, Provider} from "#source";
import {Assign, Call} from "@vifjs/language-builder/operations/basics";
import {UnitTestStatus} from "@vifjs/sim-node";
import {Bool} from "#primitives";
import {UnitTest} from "#unit";
import {Instance} from "#complex";

const TestProgram = () => {
    return BuildSource({
        blocks:
            {
                "Main": new Ob({
                    interface: {
                        constant: {
                            "CannotBeAssigned": new Bool()
                        }
                    },
                    body() {
                        return [new Assign(this.constant.CannotBeAssigned, true)]
                    },
                }),
            }
    })
}

describe("Simulation primitives", async () => {
    describe("Sqr_Fb Values", async () => {
        describe("Simulation tests", async () => {
            const container = new Container()
            await container.boot()
            const plugin = new Plugin("vitest", 200)

            plugin.on("warnings", warnings => {
                console.log(warnings)
            })

            const getExecutor = await plugin.getAsyncExecutor().init(container)

            const program = TestProgram()

            await getExecutor.loadProvider(Provider.toAst());
            it("Should fail since we're trying to assign a value to a constant", () => {
                return getExecutor.loadProgram(program.toAst())
                    .catch((x) => {
                        expect(x.message).to.include("Attempt to assign a constant value")
                    })
            })
        })
    })
})

