import {NumberRepresentation, Primitive} from "../primitives.js";

/*
 * Float family.
 * 
 * These types extend the float family:
 * 
 * - Real
 * - LReal
 * 
 */
export abstract class PlcFloat<Attributes> extends Primitive<Attributes> {
    public readonly family: "PlcFloat" = "PlcFloat"
    public abstract readonly __type: string
    public abstract readonly offset: number
    public abstract readonly defaultValue: any
    public abstract readonly representation: NumberRepresentation
    public declare readonly value?: number
    protected constructor(value?: number | bigint, attributes?: Attributes){
        super(value, attributes)
    }
}