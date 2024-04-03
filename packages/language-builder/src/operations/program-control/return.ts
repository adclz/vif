import ast from "@/src/language/ast/ast.js";
import Operation from "@/src/operations/operation.js";
import {Trace} from "@/src/language/base-behavior/traceable.js";

export interface return_ast extends ast {
    ty: 'return',
    src: {
        trace?: Trace,
    }
}

export class Return extends Operation<void> {
    constructor() {
        super()
    }

    public toAst = (): return_ast => ({
        ty: 'return',
        src: {
            ...(this.__trace && {trace: this.__trace}) as {}
        }
    })
}