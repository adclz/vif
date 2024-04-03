import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {AnythingThatFits, PrimitiveLike, InferType} from "@/src/types/primitives/primitive-like.js";

export interface sqrt_ast extends ast {
    ty: "sqrt",
    src: {
        trace?: Trace,
        sqrt: target_ast
    }
}

export class Sqrt<T extends AnythingThatFits<PrimitiveLike<InferType<PlcFloat<any>>>>> extends Operation<T> {
    public sqrt: T

    constructor(sqrt: T) {
        super()
        this.sqrt = sqrt
    }


    public toAst = (): sqrt_ast => ({
        ty: "sqrt",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            sqrt: get_target_ast(this.sqrt)
        }
    })
}