import {Primitive} from "@/src/types/primitives/primitives.js";
import {ArrayInterface, Array_} from "@/src/types/complex/array.js";
import {UdtImpl} from "@/src/pou/udt.js";
import ast from "@/src/language/ast/ast.js";
import {Referable} from "@/src/language/base-behavior/referable.js";
import {member_ast, memberToAst} from "@/src/language/ast/interface.js";
import {CompilableToAst} from "@/src/language/base-behavior/compilable.js";
import {Cloneable} from "@/src/language/base-behavior/cloneable.js";
import {get_target_ast, array_values_ast, local_ref_ast, valueToConstant} from "@/src/language/ast/index.js";

export interface struct_ast extends ast {
    ty: "Struct",
    src: {
        interface: Record<string, member_ast>
    }
}

export type StructInterface = Record<string,
    Primitive<any>
    | UdtImpl<any, any>
    | _Struct<any, any>
    | Array_<ArrayInterface[]>
>;
export class _Struct<T extends StructInterface, Y> implements Referable, Cloneable, CompilableToAst {
    public readonly __type = "Struct"
    public __local?: any
    public readonly __attributes?: Y

    constructor(content: T, attributes?: Y) {
        Object.assign(this, content)
        this.__attributes = attributes
    }

    public injectLocalRefs = (parent: Referable, parent_path: string[]) => {
        const _this = this as this & StructInterface
        Object.keys(_this)
            .forEach(key => {
                const member = _this[key]
                switch (true) {
                    case member instanceof Primitive: {
                        member["__local"] = {parent, path: [...parent_path, key]};
                        break;
                    }
                    case member instanceof UdtImpl: {
                        //@ts-ignore
                        member["__local"] = {parent, path: [...parent_path, key]};
                        member.injectLocalRefs(parent, [...parent_path, key])
                        break;
                    }
                    case member instanceof _Struct: {
                        //@ts-ignore
                        member["__local"] = {parent, path: [...parent_path, key]};
                        member.injectLocalRefs(parent, [...parent_path, key])
                        break;
                    }
                    case member instanceof Array_: {
                        //@ts-ignore
                        member["__local"] = {parent, path: [...parent_path, key]};
                        member.injectLocalRefs(parent, [...parent_path, key])
                        break;
                    }
                }
            })
    }

    public toAst = (): struct_ast => ({
        ty: "Struct",
        src: {
            interface: Object.fromEntries(Object.keys(this as this & T)
                .filter(key => (!key.startsWith("__") && typeof (this as this & T)[key] !== "function"))
                .map(key => {
                    const entry = (this as this & StructInterface)[key]
                    return [key, memberToAst(entry)]
                })) as Record<string, member_ast>
        }
    })

    public clone(): this {
        const _this = this
        return new class extends _Struct<any, any> {
            constructor() {
                super(_this, _this.__attributes)
            }
        } as this
    }
}

/**
 * IEC Struct type.
 *
 * Provide the definition of the struct on the first argument of the constructor.
 *
 * The definition has to be a Record<string, **Type**>.
 *
 * Where **Type** could be one of the following:
 *  - Primitive
 *  - Implementation of Udt
 *  - Another Struct
 *  - Array
 *
 * @example
 * const MyStruct = new Struct({
 *     Field1: new Bool(),
 *     Field2: new Byte()
 * })
 */
export const ExposeStruct = <Attributes>() => {
    return _Struct as new <T extends StructInterface>
    (...args: ConstructorParameters<typeof _Struct<T, Attributes>>) => _Struct<T, Attributes> & T
}
