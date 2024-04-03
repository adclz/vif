import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {AnythingThatFits, PrimitiveLike, InferType} from "@/src/types/primitives/primitive-like.js";

export interface trunc_ast extends ast {
    ty: "trunc",
    src: {
        trace?: Trace,
        trunc: target_ast
    }
}

export class Trunc<T extends AnythingThatFits<PrimitiveLike<InferType<PlcFloat<any>>>>> extends Operation<T> {
    public trunc: T

    constructor(trunc: T) {
        super()
        this.trunc = trunc
    }
    
    public toAst = (): trunc_ast => ({
        ty: "trunc",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            trunc: get_target_ast(this.trunc)
        }
    })
}