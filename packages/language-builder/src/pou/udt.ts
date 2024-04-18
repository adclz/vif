import {Primitive} from "@/src/types/primitives/primitives.js";
import {_Struct, StructInterface} from "@/src/types/complex/struct.js";
import {Array_} from "@/src/types/complex/array.js";
import ast from "@/src/language/ast/ast.js";
import {member_ast, memberToAst} from "@/src/language/ast/interface.js";
import {
    array_values_ast,
    get_target_ast,
    local_ref_ast,
    ref_target_ast,
    valueToConstant
} from "@/src/language/ast/target.js";
import {injectLocalInMembers, injectLocalRef, Referable} from "@/src/language/base-behavior/referable.js";
import {Cloneable} from "@/src/language/base-behavior/cloneable.js";
import {CompilableToAst} from "@/src/language/base-behavior/compilable.js";
import {getTrace, Trace, Traceable} from "@/src/language/base-behavior/index.js";
import {_Instance} from "@/src/types/complex/index.js";
import {XORInterface} from "@/src/misc/interface-types.js";

export interface udt_ast extends ast {
    ty: "udt",
    src: {
        attributes?: Record<string, any>
        trace?: Trace,
        name: string,
        interface: Record<string, member_ast>
    }
}
export class Udt<T extends StructInterface, Attributes, UdtImplAttributes> implements Traceable, Referable, CompilableToAst {
    public readonly __type: string = "Udt"
    public __global?: any
    public readonly __trace?: Trace
    public __attributes?: Attributes

    constructor(content: T, attributes?: Attributes) {
        Object.assign(this, content)
        getTrace(this)
        injectLocalInMembers(this)
        this.__attributes = attributes
    }

    public toAst(): udt_ast {
        injectLocalInMembers(this)
        return {
            ty: "udt",
            src: {
                ...(this.__attributes && {attributes: this.__attributes}),
                ...(this.__trace && {trace: this.__trace}),
                name: this.__global.path.at(-1),
                interface: Object.fromEntries(Object.keys(this as any as StructInterface)
                    .filter(key => (!key.startsWith("__") && typeof (this as any)[key] !== "function"))
                    .map(key => {
                        const entry = (this as any as StructInterface)[key]
                        return [key, memberToAst(entry)]
                    })) as Record<string, member_ast>
            }
        }
    }

    /**
     * Implements the udt structure with custom parameters.
     * @returns The implemented udt structure.
     * @param content
     * @param attributes
     */
    public implement(content: Partial<XORInterface<T>>, attributes?: UdtImplAttributes): UdtImpl<T, UdtImplAttributes> & T {
        return new UdtImpl(this as Udt<T, Attributes, UdtImplAttributes>, content as T, attributes) as unknown as UdtImpl<T, UdtImplAttributes> & T
    }

    /**
     * Returns a copy of the udt structure.
     * @returns The copy of the udt structure.
     */
    public self(attributes?: UdtImplAttributes): UdtImpl<T, UdtImplAttributes> & T {
        return new UdtImpl(this as Udt<T, Attributes, UdtImplAttributes>, {} as T, attributes) as unknown as UdtImpl<T, UdtImplAttributes> & T 
    }
}

export interface udt_impl_ast extends ast {
    ty: "udt_impl",
    src: {
        of: string,
        interface: Record<string, member_ast>
    }
}

export class UdtImpl<T extends StructInterface, Attributes> implements Referable, Cloneable, CompilableToAst {
    public readonly __type: "udt_impl" = "udt_impl"
    private readonly __base: Udt<T, any, any>
    public __global?: any
    public __local?: any
    public __attributes?: Attributes
    public readonly __user_override?: T

    constructor(base: Udt<T, any, any>, content?: T, attributes?: Attributes) {
        Object.assign(this, base);
        this.__user_override = content;
        this.__base = base;
        this.__attributes = attributes
    }

    public injectLocalRefs = (parent: any, parent_path: string[]) => { 
        Object.keys(this)
            .filter(key => (!key.startsWith("__") && typeof this[key as keyof this] !== "function"))
            .forEach(key => {
                const member = this[key as keyof this]
                switch (true) {
                    case member instanceof Primitive: {
                        member["__local"] = {parent, path: [...parent_path, key]};
                        break;
                    }
                    case member instanceof UdtImpl: {
                        member["__local"] = {parent, path: [...parent_path, key]};
                        member.injectLocalRefs(parent, [...parent_path, key])
                        break;
                    }
                    case member instanceof _Instance: {
                        member["__local"] = {parent, path: [...parent_path, key]};
                        member.injectLocalRefs(parent, [...parent_path, key])
                        break;
                    }
                    case member instanceof _Struct: {
                        member["__local"] = {parent, path: [...parent_path, key]};
                        member.injectLocalRefs(parent, [...parent_path, key])
                        break;
                    }
                    case member instanceof Array_: {
                        member["__local"] = {parent, path: [...parent_path, key]};
                        member.injectLocalRefs(parent, [...parent_path, key])
                        break;
                    }
                }
            })
    }
    

    public toAst = (): udt_impl_ast => ({
            ty: 'udt_impl',
            src: {
                of: (get_target_ast(this.__base) as ref_target_ast).src.path.at(-1)!,
                interface: this.__user_override ?
                    (Object.fromEntries(Object.keys(this.__user_override)
                        //@ts-ignore
                        .filter(key => (!key.startsWith("__") && typeof this.__user_override[key] !== "function"))
                        .map(key => {
                            //@ts-ignore
                            const entry = this.__user_override[key]
                            return [key, memberToAst(entry)]
                        })) as Record<string, member_ast>) : {}
            }
    })

    public clone(): this {
        const _this = this
        return new class extends UdtImpl<any, any> {
            constructor() {
                super(_this.__base, _this, _this.__attributes)
            }
        } as this
    }
}

export const ExposeUdt = <UdtAttributes, UdtImplAttributes>() => {
    return Udt as new <T extends StructInterface>
    (...args: ConstructorParameters<typeof Udt<T, UdtAttributes, UdtImplAttributes>>) => Udt<T, UdtAttributes, UdtImplAttributes> & T
}
