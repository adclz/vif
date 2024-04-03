import {Fc, FcInterface} from "@/src/pou/fc.js";
import {InstanceDb} from "@/src/pou/db/instance_db.js";
import {_Instance} from "@/src/types/complex/instance.js";
import {Fb, FbInterface} from "@/src/pou/fb.js";
import {get_target_ast, target_ast} from "@/src/language/ast/target.js";
import ast from "@/src/language/ast/ast.js";
import Operation from "@/src/operations/operation.js";
import {CallInterface} from "@/src/misc/interface-types.js";
import {getTrace, Trace} from "@/src/language/base-behavior/traceable.js";
import {call_interface_ast, callInterfaceToAst} from "@/src/language/ast/interface.js";

export interface call_ast extends ast {
    ty: 'call',
    src: {
        trace?: Trace,
        call: target_ast,
        interface: call_interface_ast
    }
}

/*
 * Call an instance.
 * Instance can either be:
 *  - Instance / InstanceDb of Fb
 *  - Fc
 */
export class Call<T extends Fc<FcInterface, Operation<void>[], any> |
    InstanceDb<Fb<FbInterface, Operation<void>[], any>, any> |
    _Instance<Fb<FbInterface, Operation<void>[], any>, any>
> extends Operation<T extends { return: infer U  } ? U : void> {
    public readonly __base: T
    public declare __return: T extends { return: infer U } ? U : void
    private readonly call_interface: CallInterface<T>

    constructor(base: T, call_interface: CallInterface<T>) {
        super()
        this.__base = base
        this.call_interface = call_interface
        getTrace(this)
    }

    public toAst = (): call_ast => ({
        ty: 'call',
        src: {
            ...(this.__trace && {trace: this.__trace}),
            interface: callInterfaceToAst(this.call_interface),
            call: get_target_ast(this.__base)
        }
    })
}
