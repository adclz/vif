import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {AnythingThatFits, PrimitiveLike, InferType} from "@/src/types/primitives/primitive-like.js";

export interface acos_ast extends ast {
    ty: "acos",
    src: {
        trace?: Trace,
        acos: target_ast
    }
}


export class ACos<T extends AnythingThatFits<PrimitiveLike<InferType<PlcFloat<any>>>>> extends Operation<T> {
    public acos: T

    constructor(acos: T) {
        super()
        this.acos = acos
    }

    public toAst = (): acos_ast => ({
        ty: "acos",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            acos: get_target_ast(this.acos)
        }
    })
}