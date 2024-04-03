import {Primitive} from "../primitives.js";

/*
 * String family.
 * 
 * These types extend the string family:
 * 
 * - Char - WChar
 * - String - WString
 * 
 */
export abstract class PlcString<Attributes> extends Primitive<Attributes> {
    public abstract readonly __type: string
    public abstract readonly offset: number
    public abstract readonly defaultValue: any
    public abstract readonly representation: undefined
    public declare readonly value?: string

    protected constructor(value?: string, attributes?: Attributes){
        super(value, attributes)
    }
}