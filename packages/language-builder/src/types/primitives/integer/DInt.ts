import {PlcInteger} from "./PlcInteger.js";
import {BitAccess} from "@/src/types/primitives/bit-access.js";
import {Tuple} from "@/src/misc/tuple-type.js";

/**
 * Creates a new DInt.
 *
 * Min: -2_147_483_648 - Max: 2_147_483_647
 *
 * @example
 * const MyDInt = new DInt(2_147_483_647)
 * const MyNegativeDInt = new DInt(-2_147_483_648)
 *
 */
export class DInt<Attributes> extends PlcInteger<Attributes> {
    public override readonly __type = 'DInt'
    public override readonly offset = 4.0
    public override readonly defaultValue = 0
    public override readonly representation = 10
    constructor(value?: number, attributes?: Attributes) {
        super(value, attributes)
    }

    public getBit<T extends number>(index: BitAccess extends Tuple<BitAccess, 31>[T] ? T : never) { return new BitAccess(this, index) }

}