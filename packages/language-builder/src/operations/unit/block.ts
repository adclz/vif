import ast from "@/src/language/ast/ast.js";
import Operation from "@/src/operations/operation.js";
import {Trace} from "@/src/language/base-behavior/traceable.js";

export interface unit_block_ast extends ast {
    ty: 'unit_block',
    src: {
        trace?: Trace,
        block: ast[],
        description: string
    }
}

export class UnitBlock<T extends Operation<void>, Y extends string> extends Operation<void> {
    public block: T[]
    public description: Y

    constructor(description: Y, ...block: T[]) {
        super()
        this.block = block
        this.description = description
    }

    public toAst = (): unit_block_ast => ({
        ty: 'unit_block',
        src: {
            ...(this.__trace && {trace: this.__trace}),
            block: this.block.map(x => x.toAst()),
            description: this.description
        }
    })
}
