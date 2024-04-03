import {Primitive} from "@/src/types/primitives/primitives.js";
import {interfaceToAst, interface_ast} from "@/src/language/ast/interface.js";
import {Array_} from "@/src/types/complex/array.js";
import {_Struct} from "@/src/types/complex/struct.js";
import {UdtImpl} from "@/src/pou/udt.js";
import {_Instance} from "@/src/types/complex/instance.js";
import Operation from "@/src/operations/operation.js";
import {MatchFbInterface} from "@/src/misc/interface-types.js";
import ast from "@/src/language/ast/ast.js";
import {injectLocalRef, Referable} from "@/src/language/base-behavior/referable.js";
import {getTrace, Trace, Traceable} from "@/src/language/base-behavior/traceable.js";
import {CompilableToAst} from "@/src/language/base-behavior/compilable.js";

export interface fb_ast extends ast {
    "ty": string,
    "src": {
        attributes?: Record<string, any>
        trace?: Trace,
        interface: interface_ast,
        body?: ast[]
    }
}

export interface FbInterface {
    input?: Record<string, Primitive<any>>,
    output?: Record<string, Primitive<any>>,
    inout?: Record<string, UdtImpl<any, any>>,
    static?: Record<string, Primitive<any> | _Struct<any, any> | Array_<any> | UdtImpl<any, any> | _Instance<Fb<any, any, any>, any>>,
    temp?: Record<string, Primitive<any> | _Struct<any, any> | Array_<any> | UdtImpl<any, any>>,
    constant?: Record<string, Primitive<any>>,
}
export class Fb<T extends FbInterface, Y extends Operation<void>[], Z> implements Traceable, Referable, CompilableToAst {
    public readonly __type: string = 'fb'
    public readonly __body: { bivarianceHack(this: T): Y }["bivarianceHack"]
    public readonly __trace?: Trace
    public __global?: any
    public __attributes?: Z

    constructor(ctor: { interface?: MatchFbInterface<T>, body?: { bivarianceHack(this: T): Y }["bivarianceHack"], attributes?: Z}) {
        this.__body = ctor.body || (() => [] as any)
        Object.assign(this, ctor.interface)
        getTrace(this)
        this.__attributes = ctor.attributes
        injectLocalRef(this)
    }

    public toAst = (): fb_ast => {
        injectLocalRef(this)
        const body = this.__body.call(this as this & T) as Y
        
        return {
            ty: "fb",
            src: {
                ...(this.__attributes && {attributes: this.__attributes}),
                ...(this.__trace && {trace: this.__trace}),
                interface: interfaceToAst(this),
                body: body.map(x => x.toAst())
            }
        } 
    }
}

export const ExposeFb = <Attributes>() => {
    return Fb as new <T extends FbInterface>
    (...args: ConstructorParameters<typeof Fb<T, Operation<void>[], Attributes>>) => Fb<T, Operation<void>[], Attributes> & T
}
