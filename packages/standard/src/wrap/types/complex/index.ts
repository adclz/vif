import {ExposeArray,ExposeInstance,ExposeStruct} from "@vifjs/language-builder/types/complex";

const Array_ = ExposeArray<{
    version?: number
}>()

/**
 * Static array
 *
 * The constructor will accept a tuple of a single **Type**.
 *
 * Where **Type** could be one of the following:
 *  - Primitive
 *  - Implementation of Udt
 *  - Struct
 *  - Instance
 *
 * If you want a more flexible way to create an array, consider using ArrayFrom().
 *
 * @example
 * const MyArray = new _Array([new Bool(), new Bool(false])
 */
export const _Array = Array_.Array_

/**
 * Static array generator
 * 
 * Uses a callback to conditionally generate default values
 *
 * @example
 * const MyArray = ArrayFrom(5, (v: Bool, i) => i % 2 ? new Bool(true) : new Bool())
 */
export const ArrayFrom = Array_.ArrayFrom

/**
 * Instance of a Function Block.
 *
 * You must give the block to be instanced in the first argument.
 *
 * @example
 *
 * // Declare a Fb first or use an existing one.
 * const MyFb = new Fb({
 *      interface: {
 *          static: {
 *             Anything: new Byte()
 *          }
 *     }
 * },
 * body () { return [] })
 *
 * const MyInstance = new Instance(MyFb)
 *
 */
export const Instance = ExposeInstance<{
    version?: number
}>()


/**
 * IEC Struct type.
 *
 * Provide the definition of the struct on the first argument of the constructor.
 *
 * The definition has to be a Record<string, **Type**>.
 *
 * Where **Type** could be one of the following:
 *  - Primitive
 *  - Implementation of Udt
 *  - Another Struct
 *  - Array
 *
 * @example
 * const MyStruct = new Struct({
 *     Field1: new Bool(),
 *     Field2: new Byte()
 * })
 */
export const Struct = ExposeStruct<{
    version?: number
}>()
