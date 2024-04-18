import {NumberRepresentation, Primitive} from "../primitives.js";

/*
 * Integer family.
 * 
 * These types extends the binary family:
 * 
 * - SInt - USInt
 * - Int - UInt
 * - DInt - UDInt
 * - LInt - ULInt
 */
export abstract class PlcInteger<Attributes> extends Primitive<Attributes> {
    public readonly family: "PlcInteger" = "PlcInteger"
    public abstract readonly __type: string
    public abstract readonly offset: number
    public abstract readonly defaultValue: any
    public abstract readonly representation: NumberRepresentation
    public declare readonly value?: number
    protected constructor(value?: number | bigint, attributes?: Attributes){
        super(typeof value === "bigint" ? value.toString() : value, attributes)
    }
}