import {PlcString} from "./PlcString.js";

export class WString<Attributes> extends PlcString<Attributes> {
    public override readonly __type = 'WString'
    public override readonly offset = 256.0
    public override readonly defaultValue = 0
    public readonly representation: undefined;

    public constructor(value?: string, attributes?: Attributes){
        super(value, attributes)
    }
}