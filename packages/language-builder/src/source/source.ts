import { Fc, FcInterface } from "@/src/pou/fc.js";
import { Fb, FbInterface } from "@/src/pou/fb.js";
import { Udt } from "@/src/pou/udt.js";
import { Ob, ObInterface } from "@/src/pou/ob.js";
import ast from "@/src/language/ast/ast.js";
import { InstanceDb } from "@/src/pou/db/instance_db.js";
import { getTrace, Trace } from "@/src/language/base-behavior/traceable.js";
import { GlobalDb } from "@/src/pou/db/global_db.js";
import { Provider } from "@/src/source/provider.js";
import { Compiler } from "@/src/source/compiler.js";

export type AnyProgramBlock =
    Ob<ObInterface, any> |
    Fc<FcInterface, any, any> |
    Fb<FbInterface, any, any> |
    InstanceDb<any, any> |
    GlobalDb<any, any> | 
    Udt<any, any, any>

export interface ProgramBlockStructure {
    [key: string]: AnyProgramBlock | ProgramBlockStructure
}


/** Avoid declaring blocks with same name as provider (ex: an IEC_TIMER udt).
 *
 * If 2 blocks have the same name on the provider and in the user program, PlcSim will always pick the provider one first
 *
 * todo add recursive checking
 **/
export type NotInProvider<T, Y> = {
    [index in keyof T]: index extends keyof Y ? never : T[index]
}

export type MonitorStructure = {
    ["__global"]?: {
        ty: 'global',
        path: string[]
    },
    ["__type"]: string;
}[]

type ProgramAst = {
    trace?: Trace,
    signature?: string,
    blocks?: ast,
    monitor?: string[][]
}

export class Source<T extends ProgramBlockStructure,
    Z extends MonitorStructure, 
    V extends Provider<any>> {
    public blocks: T
    public monitor: Z | []
    public readonly __trace?: Trace
    public readonly signature?: string
    public readonly provider: V
    private readonly compiler: Compiler

    constructor(ctor: {
        provider: V,
        compiler: Compiler,
        blocks?: NotInProvider<T, V>,
        monitor?: (this: T) => Z,
        signature?: string,
    }) {
        getTrace(this)
        this.provider = ctor.provider
        this.blocks = ctor.blocks || {} as any
        this.signature = ctor.signature
        this.monitor = ctor.monitor ? ctor.monitor.call(this.blocks as NotInProvider<T, V>) : []
        this.compiler = ctor.compiler
    }

    public toAst = (): ProgramAst => {
        this.injectGlobalRef()
        const ast: ProgramAst = {
            ...(this.__trace && {trace: this.__trace}),
            ...(this.signature && {signature: this.signature}),
            ...(this.monitor && {monitor: this.monitor.map(x => x.__global!.path)}),
        }

        const getAst = (source: ProgramBlockStructure, path: string) => {
            if (source["toAst"])
                //@ts-expect-error TS2349
                ast[`file:///${path}`] = source.toAst()

            else
                Object.keys(source)
                    //@ts-expect-error
                    .forEach(key => getAst(source[key], path.length ? `${path}/${key}` : key))
        }
        getAst(this.blocks, "")

        return ast
    }

    /*
    * Only compile the user program and outputs as st
     */
    public compileProgram = () =>
        this.compiler.compile(this.toAst() as Record<string, ast>)

    /*
     * Compile everything and send it to the parent runner (if any).
     */
    public exportAsRunnable = () => {
        let provider;
        try {
            provider = { status: 0, data: this.provider.toAst() }
        }
        catch (e) {
            provider = { status: 1, data: e }
        }

        let program;
        try {
            program = { status: 0, data: this.toAst() }
        }
        catch (e) {
            program = { status: 1, data: e }
        }

        let compiler;
        try {
            compiler = { status: 0, data: this.compileProgram() }
        }
        catch (e) {
            compiler = { status: 1, data: e }
        }
        
        if (process.send) 
            process.send({
                protocol: this.provider.agent,
                providerName: this.provider.name,
                provider,
                program,
                compiler
            })
    }

    /*
     * Returns the provider used by this Source object.
     */
    public getProvider = () => {
        return this.provider
    }

    /*
     * Returns the compiler used by this Source object.
     */
    public getCompiler() {
        return this.compiler
    }

    /*
    * Injects the global reference for each member of a block interface.
     */
    private injectGlobalRef = () => {
        const inject = (source: ProgramBlockStructure, path: string[]) => {
            if (path.length && source["__type"])
                //@ts-expect-error 
                source["__global"] = { ty: 'global', path: path }

            Object.keys(source)
                .filter(key => typeof source[key as keyof (ProgramBlockStructure)] === "object" && key !== "__base" && key !== "parent")
                .forEach(key => {
                    const newPath = [...path]
                    const newElement = source[key as keyof (ProgramBlockStructure)]
                    // Interface types
                    if (newElement["__type"])
                        newPath.push(key)
                    //@ts-expect-error 
                    inject(source[key as keyof (ProgramBlockStructure)], newPath)
                })
        }

        // Always udt first
        const udts: any = {}
        // then global dbs
        const dbs: any = {}
        const blocks: any = {}
        Object.keys(this.blocks)
            .forEach(key => { 
                if (this.blocks[key].__type === "Udt") udts[key] = this.blocks[key]
                else if (this.blocks[key].__type === "GlobalDataBlock") dbs[key] = this.blocks[key]
                else blocks[key] = this.blocks[key]
            })
        inject(udts, [])
        inject(dbs, [])
        inject(blocks, [])
    }
}

export const ExposeSource = <V extends Provider<any>>
    (provider: V, compiler: Compiler) => {
    return <T extends ProgramBlockStructure, Z extends MonitorStructure,>
    (ctor: {blocks?: NotInProvider<T, V>, monitor?: (this: T) => Z, signature?: string}) =>
        new Source<T, Z, V>({ 
            provider, 
            compiler, 
            blocks: ctor.blocks, 
            monitor: ctor.monitor, 
            signature: ctor.signature}) as Source<T, Z, V>
}
