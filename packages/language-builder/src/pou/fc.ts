import {Primitive} from "@/src/types/primitives/primitives.js";
import {interfaceToAst, interface_ast} from "@/src/language/ast/interface.js";
import {Array_} from "@/src/types/complex/array.js";
import {_Struct} from "@/src/types/complex/struct.js";
import {UdtImpl} from "@/src/pou/udt.js";
import {_Instance} from "@/src/types/complex/instance.js";
import {Fb} from "@/src/pou/fb.js";
import Operation from "@/src/operations/operation.js";
import {MatchFcInterface} from "@/src/misc/interface-types.js";
import ast from "@/src/language/ast/ast.js";
import {injectLocalRef, Referable} from "@/src/language/base-behavior/referable.js";
import {getTrace, Trace, Traceable} from "@/src/language/base-behavior/traceable.js";
import {CompilableToAst} from "@/src/language/base-behavior/compilable.js";

export interface fc_ast extends ast {
    "ty": "fc",
    "src": {
        attributes?: Record<string, any>
        trace?: Trace,
        interface: interface_ast,
        body: ast[]
    }
}

export interface FcInterface {
    input?: Record<string, Primitive<any> | _Struct<any, any> | Array_<any> | UdtImpl<any, any>>,
    output?: Record<string, Primitive<any> | _Struct<any, any> | Array_<any> | UdtImpl<any, any>>,
    inout?: Record<string, Primitive<any> | _Struct<any, any> | Array_<any>| UdtImpl<any, any>> | _Instance<Fb<any, any, any>, any>,
    temp?: Record<string, Primitive<any> | _Struct<any, any>| Array_<any> | UdtImpl<any, any>>,
    constant?: Record<string, Primitive<any>>,
    return?: Primitive<any> | _Struct<any, any> | Array_<any> | UdtImpl<any, any>
}
export class Fc<T extends FcInterface, Y extends Operation<void>[], Z> implements Traceable, Referable, CompilableToAst {
    public readonly __type = 'fc'
    public readonly __body: { bivarianceHack(this: T): Y }["bivarianceHack"]
    public __global?: any
    public readonly __trace?: Trace
    public __attributes?: Z
    public __return?: T extends { "__return": infer U } ? U : void

    constructor(ctor: { interface?: MatchFcInterface<T>, body?: { bivarianceHack(this: T): Y }["bivarianceHack"], attributes?: Z }) {
        this.__body = ctor.body || (() => [] as any)
        Object.assign(this, ctor.interface)
        getTrace(this)
        this.__attributes = ctor.attributes
        injectLocalRef(this)
    }

    public toAst = (): fc_ast => {
        injectLocalRef(this)

        const body = this.__body.call(this as T & this) as Y

        return {
            ty: "fc",
            src: {
                ...(this.__attributes && {attributes: this.__attributes}),
                ...(this.__trace && {trace: this.__trace}),
                interface: interfaceToAst(this),
                body: body.map(x => x.toAst())
            }
        }
    }
}

export const ExposeFc = <Attributes>() => {
    return Fc as new <T extends FcInterface>
    (...args: ConstructorParameters<typeof Fc<T, Operation<void>[], Attributes>>) => Fc<T, Operation<void>[], Attributes> & T
}