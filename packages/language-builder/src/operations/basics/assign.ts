import ast from "@/src/language/ast/ast.js";
import {get_target_ast, local_ref_ast, target_ast} from "@/src/language/ast/target.js";
import {AnythingThatFits, PrimitiveLike, OffsetLessOrEqual, AnyPrimitive, InferType} from "@/src/types/primitives/primitive-like.js";
import Operation from "@/src/operations/operation.js";
import {Trace} from "@/src/language/base-behavior/traceable.js";

export interface asg_ast extends ast {
    ty: 'asg'
    src: {
        trace?: Trace,
        assign: local_ref_ast,
        to: target_ast
    }
}



/**
 * Assign a reference from a block interface with either:
 * - Another reference of the same type
 * - A constant type (implicit or explicit)
 * - An operation returning the same type
 * 
 * Assign won't accept a constant or an operation as first parameter.
 */
export class Assign<
    Accepts extends AnyPrimitive,
    With extends AnythingThatFits<Accepts>> extends Operation<void> {
    public assign: Accepts
    public to: OffsetLessOrEqual<Accepts, With>

    constructor(assign: Accepts, to: OffsetLessOrEqual<Accepts, With>) {
        super()
        this.assign = assign
        this.to = to
    }
    public toAst = (): asg_ast =>  ({
        ty: "asg",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            assign: get_target_ast(this.assign) as local_ref_ast,
            to: get_target_ast(this.to),
        }
    })
}
