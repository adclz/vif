import ast from "@/src/language/ast/ast.js";

export interface CompilableToAst {
    toAst(): ast
}
