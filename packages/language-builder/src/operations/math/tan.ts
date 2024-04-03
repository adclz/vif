import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {AnythingThatFits, PrimitiveLike, InferType} from "@/src/types/primitives/primitive-like.js";

export interface tan_ast extends ast {
    ty: "tan",
    src: {
        trace?: Trace,
        tan: target_ast
    }
}

export class Tan<T extends AnythingThatFits<PrimitiveLike<InferType<PlcFloat<any>>>>> extends Operation<T> {
    public tan: T

    constructor(tan: T) {
        super()
        this.tan = tan
    }


    public toAst = (): tan_ast => ({
        ty: "tan",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            tan: get_target_ast(this.tan)
        }
    })
}