import {NumberRepresentation, Primitive} from "../primitives.js";

/*
 * Binary family.
 * 
 * These types extends the binary family:
 * 
 * - Byte
 * - Word
 * - DWord
 * - LWord
 */
export abstract class PlcBinary<Attributes> extends Primitive<Attributes> {
    public readonly family: "PlcBinary" = "PlcBinary"
    public abstract readonly __type: string
    public abstract readonly offset: number
    public abstract readonly defaultValue: number
    public abstract readonly representation: NumberRepresentation
    public declare readonly value?: number
    protected constructor(value?: number | bigint, attributes?: Attributes) {
        super(typeof value === "bigint" ? value.toString() : value, attributes)
    }
}