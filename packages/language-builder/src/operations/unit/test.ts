import ast from "@/src/language/ast/ast.js";
import Operation from "@/src/operations/operation.js";
import {cmp_ast, Compare} from "@/src/operations/basics/index.js";
import {Trace} from "@/src/language/base-behavior/traceable.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {
    AnyPrimitiveOrOperation,
    AnythingThatFits
} from "@/src/types/primitives/primitive-like.js";

export interface test_ast extends ast {
    ty: 'unit_test',
    src: {
        trace?: Trace,
        expect: target_ast,
        with: target_ast,
        operator: "<" | ">" | "<=" | ">=" | "=" | "<>",
        description: string
    }
}

export type Continue<T extends string | void> = T extends void ? void :
    Compare<any, any, any, any, any>

/**
 * Do an operation that compares two values and check if the return is true or false.
 * 
 * Available operators: 
 * 
 * "<" | ">" | "<=" | ">=" | "=" | "<>"
 * 
 * This block is not compiled on compiler output and only exists for simulations.
 */
export class UnitTest<
    T extends string,
    Accepts extends AnyPrimitiveOrOperation,
    Z extends "<" | ">" | "<=" | ">=" | "=" | "<>",
    U extends AnythingThatFits<Accepts>> extends Operation<void> {
    public expect: Accepts
    public with: U
    public operator: Z
    public description: T
    
    constructor(description: T, expect: Accepts, operator: Z, _with: U) {
        super()
        this.expect = expect
        this.description = description
        this.operator = operator
        this.with = _with
    }

    public toAst = (): test_ast => ({
        ty: 'unit_test',
        src: {
            ...(this.__trace && {trace: this.__trace}),
            expect: get_target_ast(this.expect),
            with: get_target_ast(this.with),
            operator: this.operator,
            description: this.description
        }
    })
}