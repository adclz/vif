import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fb, Ob} from "#pou";
import {BuildSource, Provider} from "@/dist/source";
import {Call} from "@vifjs/language-builder/operations/basics";
import {UnitTestStatus} from "@vifjs/sim-node";
import {Bool} from "#primitives";
import {UnitTest} from "#unit";
import {Instance} from "#complex";

const TestProgram = () => {
    const MyFb = new Fb({interface: {}})

    return BuildSource({
        blocks:
            {
                "Main": new Ob({
                    interface: {
                        temp: {
                            "FbInstance": new Instance(MyFb, {})
                        }
                    },
                }),
                "Test_Fb": MyFb,
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
            it("Should fail since Instance can't be declared in section Temp", () => {
                return getExecutor.loadProgram(program.toAst())
                    .catch((x) => expect(x.message).to.include("Type Instance is forbidden in section Temp"))
            })
        })
    })
})

