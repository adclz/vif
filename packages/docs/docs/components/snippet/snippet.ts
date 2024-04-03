import {Container} from "@vifjs/sim-web/boot";
import {Plugin} from "@vifjs/sim-web/plugin";
import {BuildSource} from "#source";
import {ContainerParams, StopOn} from "@vifjs/sim-web";

export const CreateSnippet = async (Source: ReturnType<typeof BuildSource>, Plugin: Plugin, main: string, mode: "unit" | "start" | "parse", params?: ContainerParams) => {
    let providerAst;
    let programAst;
    try {
        providerAst = Source.getProvider().toAst()
        programAst = Source.toAst()
    } catch (error) {
        console.log(error)
        return {ty: "parse-error", error}
    }

    console.log(programAst)
    const container = new Container()
    await container.boot()
    
    if (params)
        container.loadContainerParams(params)

    const executor = await Plugin.getAsyncExecutor().init(container)

    try {
        await executor.loadProvider(providerAst)
        await executor.loadProgram(programAst)
        
        if (mode === "unit") {
            container.loadContainerParams({stopOn: StopOn.UnitTestsPassed})
            return await executor.startAndWaitUnitTests(main)
        }        
        else if (mode === "parse") return
        else return await executor.start(main)
    }
    catch (error) {
        console.log(error)
        return {ty: "vif-error", error: error.original ? error.original : error}
    }
}

export const Compile = (Source: ReturnType<typeof BuildSource>) => {
    let program;
    try {
        program = Source.compileProgram()
    } catch (error) {
        console.log(error)
        return {ty: "parse-error", error}
    }
    return program
}