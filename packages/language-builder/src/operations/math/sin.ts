import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {AnythingThatFits, PrimitiveLike, InferType} from "@/src/types/primitives/primitive-like.js";


export interface sin_ast extends ast {
    ty: "sin",
    src: {
        trace?: Trace,
        sin: target_ast
    }
}

export class Sin<T extends AnythingThatFits<PrimitiveLike<InferType<PlcFloat<any>>>>> extends Operation<T> {
    public sin: T

    constructor(sin: T) {
        super()
        this.sin = sin
    }


    public toAst = (): sin_ast => ({
        ty: "sin",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            sin: get_target_ast(this.sin)
        }
    })
}