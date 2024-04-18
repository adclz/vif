import {UdtImpl} from "@/src/pou/udt.js";
import {CallInterface} from "@/src/misc/interface-types.js";
import {getTrace, Trace} from "@/src/language/base-behavior/traceable.js";
import {get_target_ast, local_ref_ast, ref_target_ast, target_ast} from "@/src/language/ast/target.js";
import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {call_interface_ast, callInterfaceToAst, interface_ast, interfaceToAst} from "@/src/language/ast/interface.js";
import {FcInterface} from "@/src/pou/fc.js";
import {CompilableToAst} from "@/src/language/base-behavior/compilable.js";
import {InstanceDb} from "@/src/pou/index.js";
import {_Instance} from "@/src/types/complex/index.js";

export interface inner_ref_ast {
    ty: "#inner",
    src: {
        path: string[]
    }
}

class _Resolve extends Operation<any> implements CompilableToAst{
    private readonly path: string[]
    public declare readonly __return: any
    constructor(path: string[]) {
        super()
        this.path = path
    }
    
    public toAst = (): local_ref_ast | inner_ref_ast => ({
        ty: this.path[0] === "#inner" ? "#inner" : "local",
        src: {
            path: this.path[0] === "#inner" ? this.path.slice(1, this.path.length) : this.path,
        }
    })
}

export const Resolve = _Resolve as new(path: string[]) => any

export interface template_ast {
    ty: "template",
    src: {
        body: ast[]
    }
}

export interface resolve_template_ast {
    ty: "resolve_template",
    src: {
        of: string,
        inner: target_ast,
        //interface: interface_ast,
        call_interface: call_interface_ast,
    }
}

// Define what the template memory could be
export type TemplateMemory = UdtImpl<any, any> | _Instance<any, any> | InstanceDb<any, any>

/*
 * Creates a new Template
 * 
 * Use the build method to generate a headless function body.
 * 
 * 
 */
export abstract class Template implements CompilableToAst {
    public readonly __type = 'template'
    public readonly __body: (this: any) => Operation<void>[]
    public readonly __global?: any
    public readonly __trace?: Trace
    protected constructor(body: (this: any) => Operation<void>[]) {
        this.__body = body
        getTrace(this)
    }

    protected build<T, Y>(innerMemory: T, callInterface: Y, attributes?: any): Operation<void> {
        const parent = this
        return new class extends Operation<void> {
            private __attributes? = attributes
            constructor() {
                super()
            }

            public toAst = (): resolve_template_ast => ({
                ty: "resolve_template",
                src: {
                    ...(this.__attributes && {attributes: this.__attributes}),
                    of: (get_target_ast(parent) as ref_target_ast).src.path.at(-1)!,
                    inner: get_target_ast(innerMemory),
                    //interface: interfaceToAst(default_interface as unknown as any),
                    call_interface: callInterfaceToAst(callInterface)
                }
            })
        }
    }
    
    public toAst = (): template_ast => {
        const {"__body": __, ...bodyIn} = this
        const body = this.__body.call(bodyIn) as Operation<void>[]
        
        return {
            ty: "template",
            src: {
                body: body.map(x =>  x.toAst())
            }
        } as template_ast
    }
}
