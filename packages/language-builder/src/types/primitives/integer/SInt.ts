import {PlcInteger} from "./PlcInteger.js";
import {BitAccess} from "@/src/types/primitives/bit-access.js";
import {Tuple} from "@/src/misc/tuple-type.js";

/**
 * Creates a new SInt.
 *
 * Min: -128 - Max: 127
 *
 * @example
 * const MySInt = new SInt(127);
 * const MyNegativeSInt = new SInt(-128);
 *
 */
export class SInt<Attributes> extends PlcInteger<Attributes> {
    public override readonly __type = 'SInt'
    public override readonly offset = 1.0
    public override readonly defaultValue = 0
    public override readonly representation = 10
    constructor(value?: number, attributes?: Attributes) {
        super(value, attributes)
    }

    public getBit<T extends number>(index: BitAccess extends Tuple<BitAccess, 7>[T] ? T : never) { return new BitAccess(this, index) }

}