import {join} from "node:path"
import {pathToFileURL} from "node:url"
import {existsSync} from "node:fs"
import {EventEmitter} from "node:events"
import getPort from "get-port";
import {Socket} from "@/src/socket.js";
import {Server} from "@/src/server.js";
import {VifSim} from "@/src/vif-sim.js";
import child_process from "node:child_process"
import * as process from "process";

export enum State {
    None,
    Ok,
    Fail
}

export interface ServicesState {
    provider: { status: State, error?: {}},
    program: { status: State, error?: {}},
    compiler: { status: State, error?: {}}
}

export interface PipeData {
    serverPort?: number,
    socketPort?: number,
    runnerFile?: string,
    states: ServicesState
    compilerLocation?: string,
    providerName?: string,
    protocol?: string,
    transformers?: { ty: string; fn: any; }[],
    currentProviderAst?: Record<string, any>,
    currentProgramAst?: Record<string, any>,
    currentCompiled?: Record<string, any>,
}

/*
 * Start the runner with the output code of the file provided.
 * 
 * Use the `once()` and `then()` functions to listen to the runner update events.
 */
export const StartRunner = (fileName: string, options: { socketPort?: number, serverPort?: number } = {}) => {
    let socket: Socket
    let server: Server
    let sim: VifSim
    let pipeData: PipeData = {
        serverPort: null,
        socketPort: null,
        runnerFile: null,
        states: {
            provider: { status: State.None },
            program: { status: State.None },
            compiler: { status: State.None }
        },
        compilerLocation: null,
        providerName: null,
        protocol: null,
        transformers: null,
        currentProviderAst: null,
        currentProgramAst: null,
        currentCompiled: null
    }
    let pipes = []
    let cancellationToken: EventEmitter | null = null

    const loadProvider = async () => {
        try {
            await sim.getAsyncExecutor().loadProvider(pipeData.currentProviderAst)
        } catch (e) {
            pipeData.states.provider.status = State.Fail
            pipeData.states.provider.error = {
                ty: "vif-error",
                error: e.original
            }
        }
    }

    const loadProgram = async () => {
        try {
            await sim.getAsyncExecutor().loadProgram(pipeData.currentProgramAst)
        } catch (e) {
            pipeData.states.program.status = State.Fail
            pipeData.states.program.error = {
                ty: "vif-error",
                error: e.original
            }
        }
    }
    
    const loadTransformers = async () => {
        const { default: compiler } = await import(pathToFileURL(pipeData.compilerLocation).toString());
        return [
            "bool",
            "byte", "word", "dword", "lword",
            "sint", "usint", "int", "uint", "dint", "udint", "lint", "ulint",
            "real", "lreal",
            "string", "wstring", "char", "wchar",
            "time", "ltime",
            "tod", "ltod",
            "date"
        ]
            .filter(key => compiler.getTransformer(key) !== null)
            .map(key => ({ ty: key, fn: compiler.getTransformer(key).toString() }))
    }
    
    const readRunner = async () => {
        pipeData.states.provider.status = State.None
        pipeData.states.provider.error = null
        
        pipeData.states.program.status = State.None
        pipeData.states.program.error = null

        pipeData.states.compiler.status = State.None
        pipeData.states.compiler.error = null
        try {
            if (cancellationToken) cancellationToken.emit("cancel")
            cancellationToken = new EventEmitter()

            const json = await execRunner()

            pipeData.providerName = json.providerName
            pipeData.protocol = json.protocol

            if (json.provider.status === 0) {
                pipeData.states.provider.status = State.Ok
                pipeData.states.provider.error = null
                pipeData.currentProviderAst = json.provider.data
            } else {
                pipeData.states.provider.status = State.Fail
                pipeData.states.provider.error = json.provider.data
                pipeData.currentProviderAst = null
            }
            if (json.program.status === 0) {
                pipeData.states.program.status = State.Ok
                pipeData.states.program.error = null
                pipeData.currentProgramAst = json.program.data
            } else {
                pipeData.states.program.status = State.Fail
                pipeData.states.program.error = json.program.data
                pipeData.currentProgramAst = null
            }
            if (json.compiler.status === 0) {
                pipeData.states.compiler.status = State.Ok
                pipeData.states.compiler.error = null
                pipeData.currentCompiled = json.compiler.data
            } else {
                pipeData.states.compiler.status = State.Fail
                pipeData.states.compiler.error = json.compiler.data
                pipeData.currentCompiled = null
            }
            return true
        } catch(error) {
            console.error(error)
            pipeData.states.provider.status = State.Fail
            pipeData.states.provider.error = { ty: "parse-error", error }

            pipeData.states.program.status = State.Fail
            pipeData.states.program.error = { ty: "parse-error", error }

            pipeData.states.compiler.status = State.Fail
            pipeData.states.compiler.error = { ty: "parse-error", error }
            return false
        }
    } 
    
    const execRunner = () => {
        return new Promise<{providerName: string, protocol?: string, provider: any, program: any, compiler: any}>((resolve, reject) => {
            let err = [];
            let data = null;
            const exec = child_process.spawn("node", [`--import tsx ${pipeData.runnerFile}`], {
                shell: true,
                cwd: process.cwd(),
                stdio: ['ipc'],
            })
                .on("message", e => data = e)
                .on("close", () => {
                    if (err.length)
                        reject(err.map(x => x.toString()).join("\n"));
                    else
                        resolve(data);
                })
            exec.stderr.on("data", e => err.push(e))

            cancellationToken.on("cancel", () => exec.kill(0))
        })
    }
    
    const update = async () => {
        const tsxErr = await readRunner()
        if (tsxErr) await loadProgram()
        socket.sendServicesState()
        pipes.forEach(x => {
            x(pipeData, sim)
        })
    }
    
    /*
     * Called sequentially everytime the runner is updated.
     */
    const pipe = (cb: (data: PipeData, vifSim: VifSim) => void) => {
        pipes.push(cb)
        cb(pipeData, sim)
        return {pipe, once}
    }
    
    /*
     * Called once when the runner was first updated.
     * 
     * Provides an asynchronous update which force the runner to update itself.
     */
    const once = (cb: (data: PipeData, vifSim: VifSim, update: (() => Promise<void>)) => void) => {
        cb(pipeData, sim, update)
        return {pipe, once}
    }

    const run =  async () => {
        const cwd = process.cwd()
        const path = join(cwd, fileName)
        if (!existsSync(path)) throw new Error(`Could not find file ${path}`)
        pipeData.runnerFile = fileName

        await readRunner()

        pipeData.compilerLocation = join(cwd, `./node_modules/${pipeData.providerName}/dist/source/compiler.js`)
        if (!existsSync(pipeData.compilerLocation)) throw new Error(
            "Unable to find compiler at \n"
            + `./node_modules/${pipeData.providerName}/dist/source/compiler.js`
        )
        
        pipeData.transformers = await loadTransformers()
        pipeData.socketPort = options.socketPort ? options.socketPort : await getPort()
        pipeData.serverPort = options.serverPort ? options.serverPort : await getPort()
        socket = new Socket(pipeData.socketPort, pipeData)
        server = new Server(pipeData.serverPort, pipeData)
        sim = await VifSim.InitAsync(pipeData)
        
        await loadProvider()
        await loadProgram()
        return {
            pipe,
            once
        }
    }
    return run()
}
