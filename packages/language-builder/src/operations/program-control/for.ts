import ast from "@/src/language/ast/ast.js";
import Operation from "@/src/operations/operation.js";
import {
    AnyIntegerPrimitive,
    AnythingThatFits,
    InferType,
    PrimitiveLike
} from "@/src/types/primitives/primitive-like.js";
import {get_target_ast, target_ast} from "@/src/language/ast/target.js";
import {Trace} from "@/src/language/base-behavior/traceable.js";

export interface for_ast extends ast {
    ty: 'for',
    src: {
        trace?: Trace
        _for: target_ast,
        with: target_ast,
        to: target_ast,
        by?: target_ast,
        _do: ast[]
    }
}


export class ForOf<
    Accepts extends AnyIntegerPrimitive, 
    Y extends AnythingThatFits<Accepts>, 
    U extends AnythingThatFits<Accepts>, 
    Z extends AnythingThatFits<Accepts>> extends Operation<void> {
    public for: Accepts
    public with: Y
    public _to: U
    public by?: Z
    public _do: Operation<void>[] = []

    constructor(_for: Accepts, _with: Y, to: U, by?: Z) {
        super()
        this.for = _for
        this.with = _with
        this._to = to
        if (by) this.by = by
    }

    public do = <V extends Operation<void>[]>(expressions: V) => {
        this._do.push(...expressions)
        return this as Omit<this, "do"> as unknown as Operation<void>
    }

    public toAst = (): for_ast => ({
        ty: "for",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            _for: get_target_ast(this.for),
            with: get_target_ast(this.with),
            to: get_target_ast(this._to),
            ...(this.by && {by: get_target_ast(this.by)}),
            _do: this._do.map(x => x.toAst())
        }
    })
}