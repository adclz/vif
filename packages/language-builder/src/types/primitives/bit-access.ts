import {access_ast, get_target_ast} from "@/src/language/ast/target.js";
import {Primitive} from "@/src/types/primitives/primitives.js";
import {AnyNumberPrimitive} from "@/src/types/primitives/primitive-like.js";
import {Bool} from "@/src/types/primitives/boolean/Bool.js";

export class BitAccess extends Bool<any> {
    of: AnyNumberPrimitive
    at: number

    constructor(of: AnyNumberPrimitive, at: number) {
        super()
        this.of = of
        this.at = at
    }

    public toAst = (): access_ast => ({
        ty: "access",
        src: {
            type: "bit",
            of: get_target_ast(this.of),
            at: this.at
        }
    })
}