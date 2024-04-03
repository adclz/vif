import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {AnythingThatFits, PrimitiveLike, InferType} from "@/src/types/primitives/primitive-like.js";

export interface round_ast extends ast {
    ty: "round",
    src: {
        trace?: Trace,
        round: target_ast
    }
}

export class Round<T extends AnythingThatFits<PrimitiveLike<InferType<PlcFloat<any>>>>> extends Operation<T> {
    public round: T

    constructor(round: T) {
        super()
        this.round = round
    }
    
    public toAst = (): round_ast => ({
        ty: "round",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            round: get_target_ast(this.round)
        }
    })
}