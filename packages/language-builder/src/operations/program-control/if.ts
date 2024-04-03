import ast from "@/src/language/ast/ast.js";
import {get_target_ast, target_ast} from "@/src/language/ast/target.js";
import Operation from "@/src/operations/operation.js";
import {Bool, PrimitiveLike} from "@/src/types/primitives/index.js";
import {Trace} from "@/src/language/base-behavior/traceable.js";

export interface if_ast extends ast {
    ty: "if",
    src: {
        trace?: Trace,
        _if: target_ast,
        then: ast[],
        _else: ast[]
    }
}

export class If extends Operation<void> {
    public compare: Operation<Bool<any>> | PrimitiveLike<Bool<any>>
    public _then: Operation<void>[] = []
    public _else: Operation<void>[] = []
    constructor(compare: Operation<Bool<any>> | PrimitiveLike<Bool<any>>) {
        super()
        this.compare = compare
    }

    public then = <T extends Operation>(expressions: T[]) => {
        this._then.push(...expressions)
        return this
    }

    public else = <T extends Operation>(expressions: T[]) => {
        this._else.push(...expressions)
        return this
    }

    public toAst = (): if_ast => ({
        ty: "if",
        src: {
            ...(this.__trace && {trace: this.__trace}),
            _if: get_target_ast(this.compare),
            then: this._then.map(x => x.toAst()),
            _else: this._else.map(x => x.toAst())
        }
    })
}