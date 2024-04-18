import ast from "@/src/language/ast/ast.js";
import {Bool} from "@/src/types/primitives/boolean/Bool.js";
import {PlcInteger} from "@/src/types/primitives/integer/PlcInteger.js";
import {PlcBinary} from "@/src/types/primitives/binary/PlcBinary.js";
import {PlcTime} from "@/src/types/primitives/time/PlcTime.js";
import {PrimitiveLike} from "@/src/types/primitives/primitive-like.js";
import {Referable} from "@/src/language/base-behavior/referable.js";
import {PlcTod} from "@/src/types/primitives/tod/PlcTod.js";
import {PlcFloat} from "@/src/types/primitives/float/PlcFloat.js";
import {String as _String} from "@/src/types/primitives/string/String.js";
import {WString} from "@/src/types/primitives/string/WString.js";
import {Char} from "@/src/types/primitives/string/Char.js";
import {WChar} from "@/src/types/primitives/string/WChar.js";
import {BitAccess} from "@/src/types/primitives/bit-access.js";

export type target_ast = global_ref_ast | local_ref_ast | primitive_ast | access_ast
export type ref_target_ast = global_ref_ast | local_ref_ast

/**
 * AST node for a global reference (Anything declared globally)
 */
export interface global_ref_ast extends ast {
    ty: "global",
    src: {
        path: string[]
    }
}

/**
 * AST node for a local reference (Interface of calling block)
 * 
 * The ty field can either be "local" if the reference belongs to the current owning block, or "local_out" if the reference is located somewhere else (most of the time a DB).
 * 
 */
export interface local_ref_ast extends ast {
    ty: "local" | "local_out",
    src: {
        path: string[]
    }
}

/**
 * AST node for a primitive declaration.
 * 
 * Works in both interface & body.
 */
export interface primitive_ast extends ast {
    ty: string,
    src: {
        value?: number | string | boolean
    }
}

/**
 * AST node for an access.
 *
 * Works in both interface & body.
 */
export interface access_ast extends ast {
    ty: string,
    src: {
        type: string
        of: target_ast,
        at: number
    }
}

/*
 * Default array values
 * 
 * Target should be an index of the array
 */
export interface array_values_ast extends ast {
    ty: "array_values",
    src: { target: local_ref_ast, value: primitive_ast }[]
}

/**
 * Converts a bigint to a formatted string representation or return a number directly.
 *
 * @param {number | bigint} value - The number or bigint to be formatted.
 * @returns {number | string} The formatted string representation of bigint or number.
 */
export const formatBigIntAndDecimal = (value: number | bigint) => {
    if (typeof value === "bigint")
        return value.toString(10)
    if (!Number.isInteger(value) && value === 0)
        return `${value}.0`
    return value
}

/**
 * Converts a given target value to a constant AST node.
 * @param {string | number | boolean} target - The value to be converted.
 * @returns {primitive_ast | undefined} - The constant AST node representing the converted value. Returns undefined if the target value's type is not supported.
 */
export const valueToConstant = (target: string | number | boolean | PrimitiveLike<any>): primitive_ast | undefined => {
    if (target["isAlias"] == true) {
        return {
            ty: "alias",
            src: {
                name: target.name,
                ...(target.value && {value: typeof target.value === "number" ? formatBigIntAndDecimal(target.value) : target.value})
            }
        }
    }
    
    // Native js
    // Vif should be able to solve them automatically with the right context.
    if (typeof target === "number") 
        return {ty: "Implicit", src: {value: formatBigIntAndDecimal(target)}}
    if (typeof target === "string")
        return {ty: "Implicit", src: {value: target as string}}
    if (typeof target === "boolean")
        return {ty: "Implicit", src: {value: target as boolean}}

    // Explicit
    // Vif will always try to use the type with the lowest size if possible.
    // This behavior might change in a future release.
    if (target instanceof Bool)
        return {ty: target.constructor.name, src: { value: target.value ?? target.defaultValue}}
    if (target instanceof PlcBinary)
        return {
            ty: target.constructor.name.replace("_", ""),
            src: {value: target.value ? formatBigIntAndDecimal(target.value) : target.defaultValue}
        }
    if (target instanceof PlcInteger)
        return {
            ty: target.constructor.name.replace("_", ""),
            src: {value: target.value ? formatBigIntAndDecimal(target.value) : target.defaultValue}
        }
    if (target instanceof PlcFloat)
        return {
            ty: target.constructor.name.replace("_", ""),
            src: {value: target.value ? formatBigIntAndDecimal(target.value) : target.defaultValue}
        }
    if (target instanceof PlcTime)
        return {
            ty: target.constructor.name.replace("_", ""),
            src: {value: target.value ? formatBigIntAndDecimal(target.value) : target.defaultValue}
        }
    if (target instanceof PlcTod)
        return {
            ty: target.constructor.name.replace("_", ""),
            src: {value: target.value ? formatBigIntAndDecimal(target.value) : target.defaultValue}
        }

    if (target instanceof _String)
        return {ty: target.constructor.name.replace("_", ""), src: {value: target.value ?? target.defaultValue}}
    if (target instanceof WString)
        return {ty: target.constructor.name.replace("_", ""), src: {value: target.value ?? target.defaultValue}}
    if (target instanceof Char)
        return {ty: target.constructor.name.replace("_", ""), src: {value: target.value ?? target.defaultValue}}
    if (target instanceof WChar)
        return {ty: target.constructor.name.replace("_", ""), src: {value: target.value ?? target.defaultValue}}
}

/**
 * Retrieves the target abstract syntax tree (AST) for a given variable.
 *
 * @param target - The variable to get the AST for.
 * @returns The target AST for the variable.
 *
 * This function will first look for a local reference, if the parent of the reference is "self", this means the variable is called by the parent.
 *
 *  - If parent is not local, it will assume the local reference is inside another global object, so it will merge the address of the global object with the local reference.
 *
 *  - If there's no local reference, it will look for a global reference.
 *
 *  - If there's no global reference, it will try to solve it as a constant type.
 *
 *  - If it's not a constant type, it will try to call the toAst() method which is present on all operations.
 *
 *  - If toAst is undefined, then there's quite a big problem
 *
 *
 * Global references are inject by the source object when calling toAst().
 *
 * Local references are injected by Pou types when calling their toAst() implementations.
 */
export const get_target_ast = (target: Referable | number | string | boolean | PrimitiveLike<any>): target_ast => {
    try {
        // Local
        if (target["__local"] !== undefined) {
            if (target["__local"].parent === "local") return {
                ty: "local",
                src: {path: target["__local"].path as string[]}
            }
            else return {
                ty: "local_out",
                src: { path: target.__global.path }
            }
        }

        // Global
        if (target["__global"] !== undefined)
            return {ty: "global", src: {path: target["__global"].path as string[]}}

        // Access
        if (target instanceof BitAccess)
            return target.toAst()

        // Constant
        const value = valueToConstant(target)
        if (value) return value
        // Anything else
        return target.toAst()
    } catch (e: any) {
        throw new Error(`Something went wrong while trying to get a target ast.
        
${e.stack}

Target received: ${JSON.stringify(target)}.

If the error contains a "reading path" error:
 - Maybe the the parent POU is not declared in a source object.
 - You haven't filled correctly an interface with Call.
 `);
    }
}