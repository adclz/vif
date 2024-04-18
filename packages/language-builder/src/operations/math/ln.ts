import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {AnythingThatFits, PrimitiveLike, InferType} from "@/src/types/primitives/primitive-like.js";

export interface ln_ast extends ast {
    ty: "ln",
    src: {
        trace?: Trace,
        ln: target_ast
    }
}

export class Ln<T extends AnythingThatFits<PrimitiveLike<InferType<PlcFloat<any>>>>> extends Operation<T> {
    public ln: T

    constructor(ln: T) {
        super()
        this.ln = ln
    }


    public toAst = (): ln_ast => ({
        ty: "ln",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            ln: get_target_ast(this.ln)
        }
    })
}