import {Referable} from "@/src/language/base-behavior/referable.js";
import {Cloneable} from "@/src/language/base-behavior/cloneable.js";

/*
 * Abstract class of all Primitive Families
 *
 */
export abstract class Primitive<Attributes> implements Referable, Cloneable {
    public __local?: any
    public __global?: any
    public __attributes?: Attributes

    public readonly value?: any
    public abstract readonly __type: string
    public abstract readonly offset: number
    public abstract readonly defaultValue: any
    public abstract readonly representation?: NumberRepresentation

    protected constructor(value: any, attributes?: Attributes) {
        this.value = value
        this.__attributes = attributes
    }

    public clone(): this {
        const _this = this
        return new class extends Primitive<Attributes> {
            __type = _this.__type
            offset = _this.offset
            defaultValue = _this.defaultValue
            representation = _this.representation
            constructor() {
                super(_this.value, _this.__attributes);
            }
        } as this
    }
}

export type NumberRepresentation =
    2 | // Binary 
    8 | // Octal
    10 | // Decimal
    16 // Hexadecimal