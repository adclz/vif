import {Fb, FbInterface} from "@/src/pou/fb.js";
import ast from "@/src/language/ast/ast.js";
import {interfaceToAst, interface_ast} from "@/src/language/ast/interface.js";
import {
    get_target_ast,
    ref_target_ast,
    array_values_ast,
    local_ref_ast,
    valueToConstant
} from "@/src/language/ast/target.js";
import {Primitive} from "@/src/types/primitives/primitives.js";
import {UdtImpl} from "@/src/pou/udt.js";
import {_Struct, StructInterface} from "@/src/types/complex/struct.js";
import {Array_} from "@/src/types/complex/array.js";
import {XORInterface} from "@/src/misc/interface-types.js";
import {injectLocalRef, Referable} from "@/src/language/base-behavior/referable.js";
import {getTrace} from "@/src/language/base-behavior/traceable.js";
import {Cloneable, cloneInterface} from "@/src/language/base-behavior/cloneable.js";
import {CompilableToAst} from "@/src/language/base-behavior/compilable.js";
import Operation from "@/src/operations/operation.js";

export interface instance_ast extends ast {
    ty: "instance",
    src: {
        of: string,
        //interface: interface_ast
    }
}

export type InstanceInterface = Fb<FbInterface, Operation<void>[], any>
export class _Instance<T extends InstanceInterface, Y> implements Referable, Cloneable, CompilableToAst {
    public readonly __type = 'instance'
    public __local?: any
    public __global?: any
    public readonly __attributes?: Y
    private readonly __base: T

    constructor(base: T, attributes?: Y) {
        Object.assign(this, cloneInterface(base as T & FbInterface))
        this.__base = base;
        this.__attributes = attributes
        injectLocalRef(this)
        getTrace(this)
    }

    public injectLocalRefs = (parent: any, parent_path: string[]) => {
        Object.keys(this)
            .filter(key => (!key.startsWith("__") && typeof this[key as keyof this] !== "function"))
            .forEach(key_section => {
                const section = this[key_section as keyof this] as Record<string, any>
                Object.keys(section)
                    .forEach(key => {
                        //@ts-ignore
                        const member = this[key_section][key]
                        switch (true) {
                            case member instanceof Primitive: {
                                //@ts-ignore
                                member["__local"] = {parent, path: [...parent_path, key]}
                                break;
                            }
                            case member instanceof UdtImpl: {
                                member.injectLocalRefs(parent, [...parent_path, key])
                                break;
                            }
                            case member instanceof _Struct: {
                                member.injectLocalRefs(parent, [...parent_path, key])
                                break;
                            }
                            case member instanceof Array_: {
                                member.injectLocalRefs(parent, [...parent_path, key])
                                break;
                            }
                            case member instanceof _Instance: {
                                member.injectLocalRefs(parent, [...parent_path, key])
                                break;
                            }
                        }
                    })
            })
    }

    public toAst = (): instance_ast => {
        injectLocalRef(this)
        
        return {
            ty: 'instance',
            src: {
                // interface: interfaceToAst(this),
                of: (get_target_ast(this.__base) as ref_target_ast).src.path.at(-1)!
            }
        }
    }

    public clone(): this {
        const _this = this
        return new class extends _Instance<any, any> {
            constructor() {
                super(_this, _this as any)
            }
        } as this
    }
}


export const ExposeInstance = <Attributes>() => {
    return _Instance as new <T extends InstanceInterface>
    (...args: ConstructorParameters<typeof _Instance<T, Attributes>>) => _Instance<T, Attributes> & XORInterface<T>
}
