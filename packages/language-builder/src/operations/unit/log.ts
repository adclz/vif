import ast from "@/src/language/ast/ast.js";
import Operation from "@/src/operations/operation.js";
import {get_target_ast, target_ast} from "@/src/language/ast/target.js";
import {PrimitiveLike} from "@/src/types/primitives/primitive-like.js";
import {Trace} from "@/src/language/base-behavior/traceable.js";

export interface log_ast extends ast {
    ty: 'unit_log',
    src: {
        trace?: Trace,
        message: string,
        format: target_ast[],
    }
}

export class UnitLog<T extends string, Y extends PrimitiveLike<any>[]> extends Operation<void> {
    public message: T
    public format: Y
    constructor(message: T, ...format: Y) {
        super()
        this.message = message
        this.format = format
    }

    public toAst = (): log_ast => ({
        ty: 'unit_log',
        src: {
            ...(this.__trace && {trace: this.__trace}),
            message: this.message,
            format: Object.keys(this.format).map(key => get_target_ast(this.format[key as any]))
        }
    })
}
