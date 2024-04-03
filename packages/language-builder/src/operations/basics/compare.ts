import {get_target_ast, target_ast} from "@/src/language/ast/target.js";
import ast from "@/src/language/ast/ast.js";
import {
    AnythingThatFits,
    AnyPrimitiveOrOperation,
    InferType,
    PrimitiveLike
} from "@/src/types/primitives/primitive-like.js";
import {Bool} from "@/src/types/primitives/boolean/Bool.js";
import Operation from "@/src/operations/operation.js";
import {Trace} from "@/src/language/base-behavior/traceable.js";

export interface cmp_ast extends ast {
    ty: 'compare',
    src: {
        trace?: Trace,
        compare: target_ast,
        with: target_ast,
        operator: "<" | ">" | "<=" | ">=" | "=" | "<>",
        cont?: "AND" | "&" | "XOR" | "OR" | void,
        cont_with?: cmp_ast | void
    }
}


export type Continue<T extends string | void> = T extends void ? void :
    Compare<any, any, any, any, any>

export class Compare<
    Accepts extends AnyPrimitiveOrOperation,
    Operator extends "<" | ">" | "<=" | ">=" | "=" | "<>",
    With extends AnythingThatFits<Accepts>,
    U extends "AND" | "&" | "XOR" | "OR" | void,
    Z extends Continue<U>> extends Operation<Bool<any>> {
    public declare readonly expression: {
        compare: Accepts,
        with: Operator,
        to: With,
        continue?: U,
        cwith?: Z
    }

    constructor(compare: Accepts, _with: Operator, to: With)
    constructor(compare: Accepts, _with: Operator, to: With, _continue: U, _cwith: Z)
    constructor(compare: Accepts, _with: Operator, to: With, _continue?: U, _cwith?: Z) {
        super()
        this.expression = {
            compare,
            with: _with,
            to,
            continue: _continue,
            cwith: _cwith
        }
    }

    public toAst = (): cmp_ast => ({
        ty: "compare",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            compare: get_target_ast(this.expression.compare),
            operator: this.expression.with,
            with: get_target_ast(this.expression.to),
            cont: this.expression.continue,
            cont_with: this.expression.cwith ? this.expression.cwith.toAst() : undefined
        }
    })
}
