import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/target.js";
import {AnyNumberPrimitive, PrimitiveLike} from "@/src/types/primitives/primitive-like.js";
import Operation from "@/src/operations/operation.js";
import {Trace} from "@/src/language/base-behavior/traceable.js";

export interface calc_ast extends ast {
    ty: 'calc',
    src: {
        trace?: Trace,
        calc: target_ast,
        with: target_ast,
        operator: string
    }
}


type Comp<T> = PrimitiveLike<T> | Operation<T>

/**
 * Represents a mathematical calculation expression.
 * 
 * Available operators:
 * 
 * "+" | "-" | "**" | "*" | "/" | "MOD"
 */
export class Calc<T extends AnyNumberPrimitive, 
    Y extends "+" | "-" | "**" | "*" | "/" | "MOD", 
    Z extends Comp<T>> extends Operation<T> {
    public param1: T
    public operator: Y
    public param2: Z
    constructor(param1: T, operator: Y, param2: Z) {
        super()
        this.param1 = param1
        this.operator = operator
        this.param2 = param2
    }

    public toAst = (): calc_ast =>  ({
        ty: "calc",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            calc: get_target_ast(this.param1),
            with: get_target_ast(this.param2),
            operator: this.operator,
        }
    })
}