import {NumberRepresentation, Primitive} from "../primitives.js";

/*
 * Time family.
 * 
 * These types extend the time family:
 * 
 * - Time
 * - LTime
 * 
 */
export abstract class PlcTime<Attributes> extends Primitive<Attributes> {
    public readonly family = "PlcTime"
    public abstract readonly __type: string
    public abstract readonly offset: number
    public abstract readonly defaultValue: any
    public abstract readonly representation: NumberRepresentation
    public declare readonly value?: number
    protected constructor(value?: number, attributes?: Attributes){
        super(value, attributes)
    }
}