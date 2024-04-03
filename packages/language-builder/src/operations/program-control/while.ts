import ast from "@/src/language/ast/ast.js";
import {cmp_ast, Compare} from "@/src/operations/basics/index.js";
import Operation from "@/src/operations/operation.js";
import {Trace} from "@/src/language/base-behavior/traceable.js";

export interface while_ast extends ast {
    ty: 'while',
    src: {
        trace?: Trace,
        _while: cmp_ast,
        _do: ast[]
    }
}

export class While<T extends Compare<any, any, any, any, any>> extends Operation<void> {
    public while: Compare<any, any, any, any, any>
    public _do: Operation<void>[] = []

    constructor(_while: T) {
        super()
        this.while = _while
    }

    public do = <V extends Operation<void>>(expressions: V[]) => {
        this._do.push(...expressions)
        return this as Omit<this, "while" | "do">
    }

    public toAst = (): while_ast => ({
        ty: "while",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            _while: this.while.toAst(),
            _do: this._do.map(x => x.toAst())
        }
    })
}