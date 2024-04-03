import Operation from "@/src/operations/operation.js";
import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/index.js";
import {Trace} from "@/src/language/base-behavior/index.js";
import {PrimitiveLike} from "@/src/types/primitives/index.js";
import {AnyIntegerPrimitive, AnyNumberPrimitive} from "@/src/types/primitives/primitive-like.js";

export interface swap_ast extends ast {
    ty: "swap",
    src: {
        trace?: Trace,
        swap: target_ast,
    }
}

type Comp<T> = PrimitiveLike<T> | Operation<T>
export type SwapWith = Comp<AnyIntegerPrimitive>

export class Swap<T extends SwapWith> extends Operation<T> {
    public swap: T

    constructor(swap: T) {
        super()
        this.swap = swap
    }


    public toAst = (): swap_ast => ({
        ty: "swap",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            swap: get_target_ast(this.swap),
        }
    })
}