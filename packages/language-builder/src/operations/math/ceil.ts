import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {AnythingThatFits, PrimitiveLike, InferType} from "@/src/types/primitives/primitive-like.js";

export interface ceil_ast extends ast {
    ty: "ceil",
    src: {
        trace?: Trace,
        ceil: target_ast
    }
}

export class Ceil<T extends AnythingThatFits<PrimitiveLike<InferType<PlcFloat<any>>>>> extends Operation<T> {
    public ceil: T

    constructor(ceil: T) {
        super()
        this.ceil = ceil
    }
    
    public toAst = (): ceil_ast => ({
        ty: "ceil",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            ceil: get_target_ast(this.ceil)
        }
    })
}