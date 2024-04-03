import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {AnythingThatFits, PrimitiveLike, InferType} from "@/src/types/primitives/primitive-like.js";


export interface atan_ast extends ast {
    ty: "atan",
    src: {
        trace?: Trace,
        atan: target_ast
    }
}

export class ATan<T extends AnythingThatFits<PrimitiveLike<InferType<PlcFloat<any>>>>> extends Operation<T> {
    public atan: T

    constructor(atan: T) {
        super()
        this.atan = atan
    }


    public toAst = (): atan_ast => ({
        ty: "atan",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            atan: get_target_ast(this.atan)
        }
    })
}