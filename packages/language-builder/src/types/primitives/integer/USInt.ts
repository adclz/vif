import {PlcInteger} from "./PlcInteger.js";
import {BitAccess} from "@/src/types/primitives/bit-access.js";
import {Tuple} from "@/src/misc/tuple-type.js";

/**
 * Creates a new USInt.
 *
 * Min: 0 - Max: 255
 *
 * @example
 * const MyUSInt = new USInt(255)
 *
 */
export class USInt<Attributes> extends PlcInteger<Attributes> {
    public override readonly __type = 'USInt'
    public override readonly offset = 1.0
    public override readonly defaultValue = 0
    public override readonly representation = 10
    constructor(value?: number, attributes?: Attributes) {
        super(value, attributes)
    }

    public getBit<T extends number>(index: BitAccess extends Tuple<BitAccess, 7>[T] ? T : never) { return new BitAccess(this, index) }
}