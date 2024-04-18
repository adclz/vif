import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {AnythingThatFits, PrimitiveLike, InferType} from "@/src/types/primitives/primitive-like.js";

export interface sqr_ast extends ast {
    ty: "sqr",
    src: {
        trace?: Trace,
        sqr: target_ast
    }
}


export class Sqr<T extends AnythingThatFits<PrimitiveLike<InferType<PlcFloat<any>>>>> extends Operation<T> {
    public sqr: T

    constructor(sqr: T) {
        super()
        this.sqr = sqr
    }


    public toAst = (): sqr_ast => ({
        ty: "sqr",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            sqr: get_target_ast(this.sqr)
        }
    })
}