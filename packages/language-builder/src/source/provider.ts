import {Fc, FcInterface} from "@/src/pou/fc.js";
import {Fb, FbInterface} from "@/src/pou/fb.js";
import {Udt} from "@/src/pou/udt.js";
import ast from "@/src/language/ast/ast.js";
import {InstanceDb} from "@/src/pou/db/instance_db.js";
import {getTrace, Trace} from "@/src/language/base-behavior/traceable.js";
import {GlobalDb} from "@/src/pou/db/global_db.js";
import {Template} from "@/src/template/index.js";

export type AnyBlock =
    Fc<FcInterface, any, any> |
    Fb<FbInterface, any, any> |
    InstanceDb<any, any> |
    GlobalDb<any, any> |
    Udt<any, any, any> |
    Template


export interface ProviderBlocks {
    [key: string]: AnyBlock | ProviderBlocks
}

type Filtered = Record<string, string[]>

interface FilterOperations {
    assign?: Filtered
    // eq
    eq?: Filtered
    // Compare
    cmp?: Filtered
    abs?: Filtered
    acos?: Filtered
    asin?: Filtered
    atan?: Filtered
    ceil?: Filtered
    cos?: Filtered
    exp?: Filtered
    floor?: Filtered
    ln?: Filtered
    round?: Filtered
    sin?: Filtered
    sqr?: Filtered
    sqrt?: Filtered
    tan?: Filtered
    trunc?: Filtered
    add?: Filtered
    sub?: Filtered
    mul?: Filtered
    div?: Filtered
    mod?: Filtered
    rem?: Filtered
    pow?: Filtered
    rotate_left?: Filtered
    rotate_right?: Filtered
    shl?: Filtered
    shr?: Filtered
    swap?: Filtered
}

type OverrideReturn = Record<string, [string, string][]>

interface OverrideReturns {
    abs?: OverrideReturn
    acos?: OverrideReturn
    asin?: OverrideReturn
    atan?: OverrideReturn
    ceil?: OverrideReturn
    cos?: OverrideReturn
    exp?: OverrideReturn
    floor?: OverrideReturn
    ln?: OverrideReturn
    round?: OverrideReturn
    sin?: OverrideReturn
    sqr?: OverrideReturn
    sqrt?: OverrideReturn
    tan?: OverrideReturn
    trunc?: OverrideReturn
    add?: OverrideReturn
    sub?: OverrideReturn
    mul?: OverrideReturn
    div?: OverrideReturn
    mod?: OverrideReturn
    rem?: OverrideReturn
    pow?: OverrideReturn
    rol?: OverrideReturn
    ror?: OverrideReturn
    shl?: OverrideReturn
    shr?: OverrideReturn
    swap?: OverrideReturn
}

interface ForbidSections {
    input?: string[]
    inout?: string[]
    output?: string[]
    temp?: string[]
    static?: string[]
    constant?: string[]
    return?: string[]
}

type TypeAliases = Record<string, string>

type ProviderAst = {
    trace?: Trace,
    name: string,
    agent?: string,
    internal?: ast,
    type_aliases?: TypeAliases
    exclude_types?: string[]
    filter_operations?: FilterOperations
    combine?: OverrideReturns
    exclude_sections?: ForbidSections
}

export class Provider<V extends ProviderBlocks> {
    public readonly __trace: any
    public readonly name: string
    public readonly internal: V
    public readonly typeAliases?: TypeAliases 
    public readonly excludeTypes?: string[]
    public readonly filterOperations?: FilterOperations
    public readonly excludeSections?: ForbidSections
    public readonly overrideReturns?: OverrideReturns
    public readonly agent?: string

    constructor(data: {
        name: string,
        agent?: string,
        typeAliases?: TypeAliases,
        excludeTypes?: string[],
        filterOperations?: FilterOperations,
        excludeSections?: ForbidSections,
        overrideReturns?: OverrideReturns
        internal: V
    }) {
        this.name = data.name
        this.internal = data.internal
        this.typeAliases = data.typeAliases
        this.excludeTypes = data.excludeTypes
        this.filterOperations = data.filterOperations
        this.excludeSections = data.excludeSections
        this.overrideReturns = data.overrideReturns
        this.agent = data.agent
        getTrace(this)
        this.injectGlobalRef()
    }

    public toAst = (): ProviderAst => {
        const ast: ProviderAst = {
            name: this.name,
            ...(this.__trace && {trace: this.__trace}),
            ...(this.agent && {agent: this.agent}),
            ...(this.excludeTypes && {exclude_types: this.excludeTypes}),
            ...(this.typeAliases && {type_aliases: this.typeAliases}),
            ...(this.filterOperations && {filter_operations: this.filterOperations}),
            ...(this.excludeSections && {exclude_sections: this.excludeSections}),
            ...(this.overrideReturns && {override_return: this.overrideReturns}),
        }

        const getAst = (source: ProviderBlocks, path: string) => {
            if (source["toAst"])
                //@ts-expect-error 
                ast[`file:///${path}`] = source.toAst()

            else
                Object.keys(source)
                    //@ts-expect-error
                    .forEach(key => getAst(source[key as keyof (ProviderBlocks)], path.length ? `${path}/${key}` : key))
        }
        
        if (this.internal) 
            getAst(this.internal, "")

        return ast
    }
    public injectGlobalRef = () => {
        const inject = (source: ProviderBlocks, path: string[]) => {
            if (path.length && source["__type"])
                //@ts-ignore
                source["__global"] = {ty: 'global', path: path}

            Object.keys(source)
                .filter(key => typeof source[key as keyof (ProviderBlocks)] === "object" && key !== "__base" && key !== "parent")
                .forEach(key => {
                    const newPath = [...path]
                    const newElement = source[key as keyof (ProviderBlocks)]
                    // Interface types
                    if (newElement["__type"])
                        newPath.push(key)
                    //@ts-expect-error
                    inject(source[key], newPath)
                })
        }

        // Always udt first
        if (this.internal) {
            // Always udt first
            const udts: any = {}
            // then global dbs
            const dbs: any = {}
            const blocks: any = {}
            Object.keys(this.internal)
                .forEach(key => {
                    if (this.internal![key].__type === "Udt") udts[key] = this.internal![key]
                    else if (this.internal![key].__type === "GlobalDataBlock") dbs[key] = this.internal![key]
                    else blocks[key] = this.internal![key]
                })
            inject(udts, [])
            inject(dbs, [])
            inject(blocks, [])
        }
    }
}
