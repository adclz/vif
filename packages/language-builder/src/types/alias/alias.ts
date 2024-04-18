import {Primitive} from "@/src/types/primitives/index.js"
import ast from "@/src/language/ast/ast.js";
import {Byte} from "@/src/types/primitives/binary/Byte.js";

export interface type_alias_ast extends ast {
    ty: "alias",
    src: {
        name: string
        data: {
            ty: string
            src: {
                value?: number | string | boolean
            }
        }
    }
}

interface Class<T, TArgs extends unknown[]> {
    new(...args: TArgs): T
}

export const CreateTypeAlias = <Y extends Class<Primitive<any>, any>>(name: string, of : Y) => {
    return class extends of {
        public override readonly __type = new of()["__type"]
        public override readonly offset = new of()["offset"]
        public override readonly defaultValue = new of()["defaultValue"]
        public override readonly representation = new of()["representation"]
        public readonly name: string = name
        public readonly isAlias = true
        constructor(...rest:any[]) {
            super(rest)
        }
    } as Y
}

const alias = CreateTypeAlias("string_alias", Byte)
