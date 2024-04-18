import {NumberRepresentation, Primitive} from "@/src/types/primitives/primitives.js";

/*
 * Tod family.
 * 
 * These types extend the tod family:
 * 
 * - Time_Of_Day
 * - LTime_Of_Day
 * 
 */
export abstract class PlcTod<Attributes> extends Primitive<Attributes> {
    public readonly family = "PlcTod"
    public abstract readonly __type: string
    public abstract readonly offset: number
    public abstract readonly defaultValue: any
    public abstract readonly representation: NumberRepresentation
    public declare readonly value?: number
    protected constructor(value?: number, attributes?: Attributes){
        super(value, attributes)
    }
}