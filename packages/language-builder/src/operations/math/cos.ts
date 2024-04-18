import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {AnythingThatFits, PrimitiveLike, InferType} from "@/src/types/primitives/primitive-like.js";

export interface cos_ast extends ast {
    ty: "cos",
    src: {
        trace?: Trace,
        cos: target_ast
    }
}


export class Cos<T extends AnythingThatFits<PrimitiveLike<InferType<PlcFloat<any>>>>> extends Operation<T> {
    public cos: T

    constructor(cos: T) {
        super()
        this.cos = cos
    }


    public toAst = (): cos_ast => ({
        ty: "cos",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            cos: get_target_ast(this.cos)
        }
    })
}