import ast from "@/src/language/ast/ast.js";
import Operation from "@/src/operations/operation.js";
import {Trace} from "@/src/language/base-behavior/traceable.js";

export interface breakpoint_ast extends ast {
    ty: 'breakpoint',
    src: {
        trace?: Trace,
    }
}

export class BreakPoint extends Operation<void> {
    constructor() {
        super()
    }

    public toAst = (): breakpoint_ast => ({
        ty: 'breakpoint',
        src: {
            ...(this.__trace && {trace: this.__trace})
        }
    })
}