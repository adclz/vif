import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PrimitiveLike} from "@/src/types/primitives/index.js";
import {AnyNumberPrimitive} from "@/src/types/primitives/primitive-like.js";

export interface shl_ast extends ast {
    ty: "shl",
    src: {
        trace?: Trace,
        shl: target_ast,
        shl_with: target_ast
    }
}

type Comp<T> = PrimitiveLike<T> | Operation<T>
export type ShlWith = Comp<AnyNumberPrimitive>

export class Shl<T extends ShlWith> extends Operation<T> {
    public shl: T
    public shlWith: T

    constructor(shl: T, shlWith: T) {
        super()
        this.shl = shl
        this.shlWith = shlWith
    }


    public toAst = (): shl_ast => ({
        ty: "shl",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            shl: get_target_ast(this.shl),
            shl_with: get_target_ast(this.shlWith)
        }
    })
}