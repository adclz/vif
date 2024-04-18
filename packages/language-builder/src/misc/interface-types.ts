import {FbInterface} from "@/src/pou/fb.js";
import {FcInterface} from "@/src/pou/fc.js";
import {ObInterface} from "@/src/pou/ob.js";
import {PrimitiveLike} from "@/src/types/primitives/primitive-like.js";

// Only allow a registered key of the block interface
// Used when registering the interface of a new block

export type MatchFbInterface<T> = { [index in keyof T]: index extends keyof FbInterface ? T[index] : never }
export type MatchFcInterface<T> = { [index in keyof T]: index extends keyof FcInterface ? T[index] : never }
export type MatchObInterface<T> = { [index in keyof T]: index extends keyof ObInterface ? T[index] : never }

type KeysPairMatching<T, Y> = {
    [index in keyof T]: Y extends index ? T[Y] extends never ? never : index : never
}[keyof T];
type PickMatching<T, Y> = Pick<T, KeysPairMatching<T, Y>>;

type Section<T> = {
    [index in keyof T]: T[index] extends PrimitiveLike<T[index]> ? PrimitiveLike<T[index]> : T[index]
}

// XOR type to match only the defined interface, but not all keys are mandatory
// Also allow the usage of PrimitiveLike, so the user can use constant or references
// Each key is either undefined or a PrimitiveLike matching the base interface
// Overall, this permits to override the default interface keys of a block
// Eg: Create a new Instance or InstanceDb

export type XORInterface<T> = PickMatching<{[index in keyof T]: Section<Partial<T[index]>>}, "input" | "output" | "inout" | "static" | "temp" | "constant">

// Same but all keys are mandatory
// Only visible sections are allowed
// Eg: Call a new instance

export type CallInterface<T> = PickMatching<{[index in keyof T]: Section<T[index]>}, "input" | "output" | "inout">
