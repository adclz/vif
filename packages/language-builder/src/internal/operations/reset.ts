import {get_target_ast} from "@/src/language/ast/target.js";
import {PrimitiveLike} from "@/src/types/primitives/primitive-like.js";
import {Resolve} from "@/src/template/index.js";
import Operation from "@/src/operations/operation.js";

/*
 * Reset the references to their default values.
 * 
 * If the user has specified a default value, reset won't fallback to the default primitive value but the user one instead.
 * 
 * For security reasons, you can't use a reference to a complex type such as an array, struct ...
 */
export class Internal_Reset extends Operation<void> {
    public reset: (PrimitiveLike<any> | typeof Resolve)[]
    
    constructor(...reset: (PrimitiveLike<any> | typeof Resolve)[]) {
        super()
        this.reset = reset
    }
    public toAst() {
        return {
            ty: "#reset",
            src: {
                reset: this.reset.map(get_target_ast)
            }
        }
    }
}