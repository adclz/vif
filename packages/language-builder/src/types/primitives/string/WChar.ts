import {PlcString} from "./PlcString.js";

export class WChar<Attributes> extends PlcString<Attributes> {
    public override readonly __type = 'WChar'
    public override readonly offset = 1.0
    public override readonly defaultValue = ''
    public readonly representation: undefined;

    public constructor(value?: string, attributes?: Attributes){
        super(value, attributes)
    }
}