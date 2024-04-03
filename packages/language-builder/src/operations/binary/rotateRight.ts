import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PrimitiveLike} from "@/src/types/primitives/index.js";
import {AnyNumberPrimitive} from "@/src/types/primitives/primitive-like.js";

export interface rotate_r_ast extends ast {
    ty: "ror",
    src: {
        trace?: Trace,
        rotate: target_ast,
        rotate_with: target_ast
    }
}

type Comp<T> = PrimitiveLike<T> | Operation<T>
export type RotateWith = Comp<AnyNumberPrimitive>

export class RotateRight<T extends RotateWith> extends Operation<T> {
    public rotate: T
    public rotateWith: T

    constructor(rotate: T, rotateWith: T) {
        super()
        this.rotate = rotate
        this.rotateWith = rotateWith
    }

    public toAst = (): rotate_r_ast => ({
        ty: "ror",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            rotate: get_target_ast(this.rotate),
            rotate_with: get_target_ast(this.rotateWith)
        }
    })
}