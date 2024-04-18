import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PrimitiveLike} from "@/src/types/primitives/index.js";
import {AnyNumberPrimitive} from "@/src/types/primitives/primitive-like.js";

export interface shr_ast extends ast {
    ty: "shr",
    src: {
        trace?: Trace,
        shr: target_ast,
        shr_with: target_ast
    }
}

type Comp<T> = PrimitiveLike<T> | Operation<T>
export type ShrWith = Comp<AnyNumberPrimitive>

export class Shr<T extends ShrWith> extends Operation<T> {
    public shr: T
    public shrWith: T

    constructor(shr: T, shrWith: T) {
        super()
        this.shr = shr
        this.shrWith = shrWith
    }


    public toAst = (): shr_ast => ({
        ty: "shr",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            shr: get_target_ast(this.shr),
            shr_with: get_target_ast(this.shrWith)
        }
    })
}