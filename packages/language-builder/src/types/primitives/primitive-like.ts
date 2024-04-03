import { PlcInteger } from "@/src/types/primitives/integer/PlcInteger.js";
import { PlcBinary } from "@/src/types/primitives/binary/PlcBinary.js";
import { PlcString } from "@/src/types/primitives/string/PlcString.js";
import { Bool } from "@/src/types/primitives/boolean/Bool.js";
import { String } from "@/src/types/primitives/string/String.js";
import { WString } from "@/src/types/primitives/string/WString.js";
import { Char } from "@/src/types/primitives/string/Char.js";
import { WChar } from "@/src/types/primitives/string/WChar.js";

import { PlcTime } from "@/src/types/primitives/time/PlcTime.js";
import { PlcFloat } from "@/src/types/primitives/float/PlcFloat.js";
import { PlcTod } from "@/src/types/primitives/tod/PlcTod.js";
import Operation from "@/src/operations/operation.js";
import { Resolve } from "@/src/template/template.js";
import { Compare } from "@/src/language/typescript/compare.js";

type AnyIntegerT<T> = AnyIntegerPrimitive | number
type booleanType<T> = Bool<any> | boolean
type floatType<T> = PlcFloat<any> | number
type stringType<T> = T extends String<any> ? T | string :
    T extends WString<any> ? T | string :
    T extends Char<any> ? T | string :
    T extends WChar<any> ? T | string : never
/**
 * Any type that could be used to fit in a PlcType family.
 *
 * @template T - The type to be checked for primitive-like properties.
 */
export type PrimitiveLike<T> =
    T extends Bool<any> ? booleanType<T> :
    T extends PlcInteger<any>
    ? AnyIntegerT<T>
    : T extends PlcBinary<any>
    ? AnyIntegerT<T>
    : T extends PlcTime<any>
    ? AnyIntegerT<T>
    : T extends PlcTod<any>
    ? AnyIntegerT<T>
    : T extends PlcFloat<any>
    ? floatType<T>
    : T extends PlcString<any>
    ? stringType<T>
    : T extends typeof Resolve ? any : never

type INVALID_OFFSET = "Type cannot be converted safely"
/** 
 * Checks if Y offset (size in bytes) is less or equal to T.
 * 
 * If less or equal, returns INVALID_OFFSET.
 * 
 * If T and Y are not numbers, keep things unchanged.
 */
export type OffsetLessOrEqual<T, Y> =
    T extends number ? Y : Y extends number ? Y :
    T extends { offset: number | bigint } ? Y extends { offset: number | bigint } ?
    Compare<T["offset"], Y["offset"]> extends 0 ? Y
    : Compare<T["offset"], Y["offset"]> extends 1 ? Y : INVALID_OFFSET : Y : Y

/**
* Gets the return type of an operation as a primitive or returns the primitive directly.
* 
* T cannot be a native js value.
*/
export type InferType<T> =
    T extends { __return: infer U } ? InferType<U> :
    T extends AnyPrimitive ? T : T extends typeof Resolve ? any : never


type PrimitiveOrOperation<T> = Operation<T> | T

/**
 * Literally anything that could return something compatible with T generic
 *
 * - A constant type (implicit or explicit) but still compatible with T.
 * - An operation returning the same type.
 * - A resolve (provider only).
 */
export type AnythingThatFits<T> = PrimitiveOrOperation<PrimitiveLike<InferType<T>>>

/*
 * Any primitive type
 */
export type AnyPrimitive =
    Bool<any> |
    PlcInteger<any> |
    PlcBinary<any> |
    PlcFloat<any> |
    PlcTime<any> |
    PlcTod<any> |
    PlcString<any>

/*
 * Any primitive type or operation that returns a primitive type
 */
export type AnyPrimitiveOrOperation = AnyPrimitive | Operation<any>

/*
 * Any number type
 */
export type AnyNumberPrimitive =
    PlcInteger<any> |
    PlcBinary<any> |
    PlcFloat<any> |
    PlcTime<any> |
    PlcTod<any> 

/*
 * Any integer type
 */
export type AnyIntegerPrimitive =
    PlcInteger<any> |
    PlcBinary<any> |
    PlcTime<any> |
    PlcTod<any> 