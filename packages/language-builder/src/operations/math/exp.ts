import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {AnythingThatFits, PrimitiveLike, InferType} from "@/src/types/primitives/primitive-like.js";

export interface exp_ast extends ast {
    ty: "exp",
    src: {
        trace?: Trace,
        exp: target_ast
    }
}

export class Exp<T extends AnythingThatFits<PrimitiveLike<InferType<PlcFloat<any>>>>>  extends Operation<T> {
    public exp: T

    constructor(exp: T) {
        super()
        this.exp = exp
    }

    public toAst = (): exp_ast => ({
        ty: "exp",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            exp: get_target_ast(this.exp)
        }
    })
}