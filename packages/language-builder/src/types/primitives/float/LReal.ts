import {PlcFloat} from "./PlcFloat.js";

export class LReal<Attributes> extends PlcFloat<Attributes> {
    public override readonly __type = 'LReal'
    public override readonly offset = 8.0
    public override readonly defaultValue = 0.0
    public override readonly representation = 10
    public constructor(value?: number | bigint, attributes?: Attributes){
        if (Number.isInteger(value)) throw new Error("Invalid Float Number")
        super(value, attributes)
    }
}