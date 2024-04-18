import {Primitive} from "@/src/types/primitives/primitives.js";
import {Udt, UdtImpl} from "@/src/pou/udt.js";
import {_Struct, StructInterface} from "@/src/types/complex/struct.js";
import {Array_, ArrayInterface} from "@/src/types/complex/array.js";
import {
    interface_ast,
    interfaceToAst,
} from "@/src/language/ast/interface.js";
import {injectLocalRef, Referable} from "@/src/language/base-behavior/referable.js";
import {getTrace, Trace, Traceable} from "@/src/language/base-behavior/traceable.js";
import {CompilableToAst} from "@/src/language/base-behavior/compilable.js";
import {cloneInterface, cloneMembers} from "@/src/language/base-behavior/index.js";
import {FbInterface} from "@/src/pou/index.js";
import {get_target_ast, ref_target_ast} from "@/src/language/ast/index.js";

export interface global_db_ast {
    ty: "global_db",
    src: {
        of?: string
        attributes?: Record<string, any>
        trace?: Trace,
        interface: interface_ast
    }
}

export type GlobalDbInterface = Record<string,
    Primitive<any>
    | UdtImpl<any, any>
    | _Struct<StructInterface, any>
    | Array_<ArrayInterface[]>
> | Udt<any, any, any>;

export class GlobalDb<T extends GlobalDbInterface, Y> implements Traceable, Referable, CompilableToAst {
    public readonly __type = "GlobalDataBlock"
    public readonly __base?: T
    public readonly static: T
    public __global?: any
    public readonly __trace?: Trace
    public __attributes?: Y
    constructor(content: T, attributes?: Y) {
        this.static = {} as any
        if (content instanceof Udt) {
            Object.assign(this.static, cloneMembers(content as T & StructInterface))
            this.__base = content
        }
        else this.static = content
        getTrace(this)
        this.__attributes = attributes
        injectLocalRef(this, "global")
    }

    public toAst = (): global_db_ast => {
        injectLocalRef(this, "global")
        const h = interfaceToAst(this)
        return {
            ty: "global_db",
            src: {
                ...(this.__attributes && {attributes: this.__attributes}),
                ...(this.__trace && {trace: this.__trace}),
                ...(this.__base && {of: (get_target_ast(this.__base) as ref_target_ast).src!.path.at(-1)!}),
                interface: interfaceToAst(this),
            }
        }
    }
}

export const ExposeGlobalDb = <Attributes>() => {
    return GlobalDb as new <T extends GlobalDbInterface>
    (...args: ConstructorParameters<typeof GlobalDb<T, Attributes>>) => GlobalDb<T, Attributes> & {static: T}
}