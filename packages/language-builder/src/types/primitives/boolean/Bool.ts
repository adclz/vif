import {Primitive} from "../primitives.js";

/**
 * Creates a new Bool.
 * 
 * @example
 *
 * const MyBool = new Bool(true)
 *
 */
export class Bool<Attributes> extends Primitive<Attributes> {
    public readonly family = "PlcBool"
    public readonly __type = 'Bool'
    public readonly offset = 0.1;
    public readonly defaultValue = false
    public declare readonly value?: boolean
    public representation?: undefined;
    
    constructor(value?: boolean, attributes?: Attributes) {
        super(value, attributes)
    }
}
