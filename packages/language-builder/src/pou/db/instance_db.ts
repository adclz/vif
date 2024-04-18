import {Fb, FbInterface} from "@/src/pou/fb.js";
import {interfaceToAst, interface_ast} from "@/src/language/ast/interface.js";
import {get_target_ast, ref_target_ast} from "@/src/language/ast/target.js";
import Operation from "@/src/operations/operation.js";
import {XORInterface} from "@/src/misc/interface-types.js";
import ast from "@/src/language/ast/ast.js";
import {Udt} from "@/src/pou/udt.js";
import {injectLocalRef, Referable} from "@/src/language/base-behavior/referable.js";
import {getTrace, Trace} from "@/src/language/base-behavior/traceable.js";
import {cloneInterface, cloneMembers} from "@/src/language/base-behavior/cloneable.js";
import {StructInterface} from "@/src/types/complex/index.js";

export interface instance_db_ast extends ast {
    ty: 'instance_db',
    src: {
        attributes?: Record<string, any>
        trace?: Trace,
        of: string,
    }
}

export type InstanceDbInterface = Fb<FbInterface, Operation<void>[], any>

export class InstanceDb<T extends InstanceDbInterface, Y> implements Referable {
    public readonly __type = 'instance_db'
    public __global?: any
    public readonly __trace?: Trace
    private readonly __base: T
    public __attributes?: Y
    
    constructor(base: T, attributes?: Y) {
        Object.assign(this, cloneInterface(base as T & FbInterface))
        this.__base = base
        this.__attributes = attributes
        injectLocalRef(this, "global")
        getTrace(this)
    }

    public toAst = (): instance_db_ast => {
        injectLocalRef(this, "global")
        return  {
            ty: 'instance_db',
            src: {
                ...(this.__attributes && {attributes: this.__attributes}),
                ...(this.__trace && {trace: this.__trace}),
                of: (get_target_ast(this.__base) as ref_target_ast).src!.path.at(-1)!
            }
        }
    }
}

export const ExposeInstanceDb = <Attributes>() => {
    return InstanceDb as new <T extends InstanceDbInterface>
    (...args: ConstructorParameters<typeof InstanceDb<T, Attributes>>) => InstanceDb<T, Attributes> & T
}