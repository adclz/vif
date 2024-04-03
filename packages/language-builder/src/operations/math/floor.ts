import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {AnythingThatFits, PrimitiveLike, InferType} from "@/src/types/primitives/primitive-like.js";

export interface floor_ast extends ast {
    ty: "floor",
    src: {
        trace?: Trace,
        floor: target_ast
    }
}


export class Floor<T extends AnythingThatFits<PrimitiveLike<InferType<PlcFloat<any>>>>>  extends Operation<T> {
    public floor: T

    constructor(floor: T) {
        super()
        this.floor = floor
    }
    
    public toAst = (): floor_ast => ({
        ty: "floor",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            floor: get_target_ast(this.floor)
        }
    })
}