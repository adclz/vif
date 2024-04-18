import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {AnythingThatFits, PrimitiveLike, InferType} from "@/src/types/primitives/primitive-like.js";

export interface asin_ast extends ast {
    ty: "asin",
    src: {
        trace?: Trace,
        asin: target_ast
    }
}

export class ASin<T extends AnythingThatFits<PrimitiveLike<InferType<PlcFloat<any>>>>> extends Operation<T> {
    public asin: T

    constructor(asin: T) {
        super()
        this.asin = asin
    }


    public toAst = (): asin_ast => ({
        ty: "asin",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            asin: get_target_ast(this.asin)
        }
    })
}