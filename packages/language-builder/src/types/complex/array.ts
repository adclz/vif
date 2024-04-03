import {Primitive} from "@/src/types/primitives/primitives.js";
import {_Struct} from "@/src/types/complex/struct.js";
import {UdtImpl} from "@/src/pou/udt.js";
import {_Instance} from "@/src/types/complex/instance.js";
import {member_ast, memberToAst} from "@/src/language/ast/interface.js";
import {Referable} from "@/src/language/base-behavior/referable.js";
import {CompilableToAst} from "@/src/language/base-behavior/compilable.js";
import {Cloneable} from "@/src/language/base-behavior/cloneable.js";
import {get_target_ast, array_values_ast, local_ref_ast, valueToConstant} from "@/src/language/ast/index.js";

export interface array_ast {
    ty: 'array',
    src: {
        length: number
        of: member_ast,
        values?: array_values_ast
    }
}


export type ArrayInterface =
    Primitive<any>
    | UdtImpl<any, any>
    | _Struct<any, any>
    | _Instance<any, any>

// https://stackoverflow.com/questions/52489261/typescript-can-i-define-an-n-length-tuple-type
export type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
export type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

interface ArrayOverride extends Referable, Cloneable, CompilableToAst {
    injectLocalRefs(parent: any, parent_path: string[]): void
    getStartValues(): array_values_ast["src"]
    toAst(): array_ast
    clone(): this
}


class _Array<const T extends ArrayInterface> extends Array<T> implements Referable, Cloneable, CompilableToAst {
    public readonly __type = "Array"
    public __local?: any
    public readonly __attributes?: any
    
    constructor(data: T[], attributes?: any) {
        super(...data.map(x => x))
        this.__attributes = attributes
    }

    public injectLocalRefs = (parent: any, parent_path: string[]) => {
        for (let i = 0; i < this.length; i++) {
            switch (true) {
                case this[0] instanceof Primitive: {
                    this[i]["__local"] = {parent, path: [...parent_path, `[${i.toString()}]`]}
                    break;
                }
                case this[0] instanceof UdtImpl: {
                    this[0].injectLocalRefs(parent, [...parent_path, `[${i.toString()}]`])
                    break;
                }
                case this[0] instanceof _Struct: {
                    this[0].injectLocalRefs(parent, [...parent_path, `[${i.toString()}]`])
                    break;
                }
                case this[0] instanceof _Instance: {
                    this[0].injectLocalRefs(parent, [...parent_path, `[${i.toString()}]`])
                    break;
                }
            }
        }
    }

    public getStartValues(): array_values_ast["src"] {
        const values: array_values_ast["src"] = []
        const _this = this as Array_<any>
        for (let i = 0; i < this.length; i++) {
            if (this[i] instanceof Primitive) {
                if (typeof _this[i].value !== "undefined")
                    values.push({
                    target: {    
                        ty: "local",
                            src: {
                                path: [`[${i}]`]
                            }
                    } as local_ref_ast, value: valueToConstant(_this[i].value)!})
            } else if (_this[i].toAst)
                values.push({
                target: {
                        ty: "local",
                        src: {
                            path: [`[${i}]`]
                        }
                    } as local_ref_ast, value: _this[i].toAst()})
        }
        // Filters the path until the array index
        return values
    }

    public toAst = (): array_ast => ({
        ty: 'array',
        src: {
            length: this.length,
            of: this.deleteInterface(memberToAst(this[0])!),
            values: {ty: "array_values", src: this.getStartValues()}
        }
    })
    
    private deleteInterface = (of: {ty: string, src: any}) => {
        if (of.src["interface"])
            of.src["interface"] = {}
        return of
    }
    

    public clone(): this {
        const _this = this
        return new class extends _Array<any> {
            constructor() {
                super(Array.from(_this), _this.__attributes)
            }
        } as this
    }
}


type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift' | 'map' | number
type FixedLengthArray<T extends ArrayInterface[]> = Pick<T, Exclude<keyof T, ArrayLengthMutationKeys>>
type EnsureSameType<T extends any[]> = T extends [infer U, ...infer Rest] ? U extends Rest[number] ? T : Rest extends [] ? T : never : T;

export type Array_<T extends ArrayInterface[]> = FixedLengthArray<EnsureSameType<T>> & ArrayOverride
export const Array_ = _Array as (new <T extends ArrayInterface[]>(args: [...EnsureSameType<T>]) => Array_<EnsureSameType<T>>)

export const ExposeArray = <Attributes>() => {
    return {
        /**
         * Static array
         *
         * The constructor will accept a tuple of a single **Type**.
         *
         * Where **Type** could be one of the following:
         *  - Primitive
         *  - Implementation of Udt
         *  - Struct
         *  - Instance
         *
         * If you want a more flexible way to create an array, consider using ArrayFrom().
         *
         * @example
         * const MyArray = new _Array([new Bool(), new Bool(false])
         */
        Array_,
        ArrayFrom: <T extends ArrayInterface, Y extends number>(length: Y, type: (v: T, i: number) => T, attributes?: Attributes): Array_<Tuple<T, Y>> => {
            return new Array_(Array.from({length}, type)) as Array_<Tuple<T, Y>>
        }
    }
}