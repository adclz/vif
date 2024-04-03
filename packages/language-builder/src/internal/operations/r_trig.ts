import {get_target_ast} from "@/src/language/ast/target.js";
import {PrimitiveLike} from "@/src/types/primitives/primitive-like.js";
import {Bool} from "@/src/types/primitives/boolean/Bool.js";
import Operation from "@/src/operations/operation.js";

export class Internal_R_Trig extends Operation<Bool<any>> {
    public input: PrimitiveLike<Bool<any>>
    public declare __return: Bool<any>
    
    constructor(input: Bool<any>) {
        super()
        this.input = input
    }
    public toAst() {
        return {
            ty: "#r_trig",
            src: {
                input: get_target_ast(this.input)
            }
        }
    }
}