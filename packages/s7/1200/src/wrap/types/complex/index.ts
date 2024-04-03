import {ExposeArray,ExposeInstance,ExposeStruct} from "@vifjs/language-builder/types/complex";

const Array_ = ExposeArray<{
    s7oa?: boolean, 
    version?: number
}>()

export const _Array = Array_.Array_
export const ArrayFrom = Array_.ArrayFrom

export const Instance = ExposeInstance<{
    s7oa?: boolean,
    version?: number
}>()

export const Struct = ExposeStruct<{
    s7oa?: boolean,
    version?: number
}>()