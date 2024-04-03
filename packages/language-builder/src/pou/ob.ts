import {Primitive} from "@/src/types/primitives/primitives.js";
import {interfaceToAst, interface_ast} from "@/src/language/ast/interface.js";
import {Array_, ArrayInterface} from "@/src/types/complex/array.js";
import {_Struct, StructInterface} from "@/src/types/complex/struct.js";
import ast from "@/src/language/ast/ast.js";
import Operation from "@/src/operations/operation.js";
import {_Instance} from "@/src/types/complex/instance.js";
import {Fb, FbInterface} from "@/src/pou/fb.js";
import {MatchObInterface} from "@/src/misc/interface-types.js";
import {injectLocalRef, Referable} from "@/src/language/base-behavior/referable.js";
import {getTrace, Trace, Traceable} from "@/src/language/base-behavior/traceable.js";
import {CompilableToAst} from "@/src/language/base-behavior/compilable.js";

export interface ob_ast extends ast {
    "ty": "ob",
    "src": {
        attributes?: Record<string, any>
        trace?: Trace,
        interface: interface_ast,
        body: ast[]
    }
}
export interface ObInterface {
    temp?: Record<string, Primitive<any> | _Struct<StructInterface, any> | Array_<ArrayInterface[]> | _Instance<Fb<FbInterface, Operation<void>[], any>, any>>, 
    constant?: Record<string, Primitive<any>>,
}
export class Ob<T extends ObInterface, Y extends Operation<void>[]> implements Traceable, Referable, CompilableToAst{
    public readonly __type = 'ob'
    public readonly __body: { bivarianceHack(this: T): Y }["bivarianceHack"]
    public readonly __global: any
    public readonly __trace?: Trace    
    public __attributes?: any

    constructor(ctor: { interface?: MatchObInterface<T>, body?: { bivarianceHack(this: T): Y }["bivarianceHack"], attributes?: any }) {
        this.__body = ctor.body || (() => [] as any)
        Object.assign(this, ctor.interface)
        getTrace(this)
        this.__attributes = ctor.attributes
        injectLocalRef(this)
    }
    
    public toAst = (): ob_ast => {
        injectLocalRef(this)
        const body = this.__body.call(this as this & T) as Y
        
        return {
            ty: "ob",
            src: {
                ...(this.__attributes && {attributes: this.__attributes}),
                ...(this.__trace && {trace: this.__trace}),                
                interface: interfaceToAst(this),
                body: body.map(x => x.toAst())
            }
        }
    }
}

export const ExposeOb = <Attributes>() => {
    return Ob as new <T extends ObInterface>
    (...args: ConstructorParameters<typeof Ob<T, Operation<void>[]>>) => Ob<T, Operation<void>[]>
}
