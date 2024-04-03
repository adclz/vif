import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {PlcInteger} from "@/src/types/primitives/integer/PlcInteger.js";
import {AnythingThatFits, PrimitiveLike, InferType} from "@/src/types/primitives/primitive-like.js";

export interface abs_ast extends ast {
    ty: "abs",
    src: {
        trace?: Trace,
        abs: target_ast
    }
}


export class Abs<T extends AnythingThatFits<PrimitiveLike<InferType<PlcFloat<any> | PlcInteger<any>>>>> extends Operation<T> {
    public abs: T

    constructor(abs: T) {
        super()
        this.abs = abs
    }

    public toAst = (): abs_ast => ({
        ty: "abs",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            abs: get_target_ast(this.abs)
        }
    })
}