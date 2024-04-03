import {Fb} from "@/src/pou/fb.js";
import {Primitive} from "@/src/types/primitives/primitives.js";
import {_Struct, struct_ast} from "@/src/types/complex/struct.js";
import {Array_, array_ast} from "@/src/types/complex/array.js";
import {udt_impl_ast, UdtImpl} from "@/src/pou/udt.js";
import {_Instance, instance_ast} from "@/src/types/complex/instance.js";
import {get_target_ast, primitive_ast, target_ast} from "@/src/language/ast/target.js";

/**
 * Ast syntax of any block interface.
 */
export interface interface_ast {
    ty: "interface",
    src: {
        input?: Record<string, member_ast>
        output?: Record<string, member_ast>
        inout?: Record<string, member_ast>
        temp?: Record<string, member_ast>
        constant?: Record<string, member_ast>
        static?: Record<string, member_ast>
        return?: member_ast
    }
}

/**
 * Ast node of a member from any interface section.
 */
export type member_ast = primitive_ast | struct_ast | array_ast | udt_impl_ast | instance_ast

/*
 * Converts any block interface to ast
 */

export const interfaceToAst = (base: Record<string, any>) => {
    const interfaceAst: interface_ast = {ty: "interface", src:{}}

    if ("input" in base)
        interfaceAst.src.input = sectionToAst(base["input"])

    if ("output" in base)
        interfaceAst.src.output = sectionToAst(base["output"])

    if ("inout" in base)
        interfaceAst.src.inout = sectionToAst(base["inout"])

    if ("static" in base)
        interfaceAst.src.static = sectionToAst(base["static"])

    if ("temp" in base)
        interfaceAst.src.temp = sectionToAst(base["temp"])

    if ("constant" in base)
        interfaceAst.src.constant = sectionToAst(base["constant"])

    if ("return" in base) {
        const _return = base["return"] as Primitive<any>
        interfaceAst.src.return = {
            ty: _return.__type,
            src: {value: _return.value ? _return.value : _return.defaultValue}
        }
    }
    return interfaceAst
}

/*
 * Converts a section of an interface to ast
 */
const sectionToAst = (section: Record<string, any>): Record<string, member_ast> => {
    return Object.fromEntries(Object.keys(section)
        .map(key => {
            const member = section[key]
            return [key, memberToAst(member)]
        })) as Record<string, member_ast>
}

/*
 * Converts a member of a section to ast
 */
export const memberToAst = (member: any) => {
    if (member["isAlias"] == true) {
        return {
            ty: "alias",
            src: {
                of: member.name,
                ...(member.value && {value: member.value})
            }
        }
    }
    if (member instanceof Primitive)
        return {
        ty: member.__type, 
            src: {
            ...(member.value && {value: member.value})
        }
    }
    if (member instanceof _Struct)
        return member.toAst();
    if (member instanceof Array_)
        return member.toAst();
    if (member instanceof UdtImpl)
        return member.toAst();
    if (member instanceof _Instance)
        return member.toAst();
    if (member instanceof Fb)
        return member.toAst();
}

/*
 * Ast of a block call
 * 
 * Contains the interface of the block to call (input, inout, output, return).
 * 
 * And the values / references for each interface member.
 */
export interface call_interface_ast {
    ty: "call_interface"
    src: {
        input?: Record<string, target_ast>,
        inout?: Record<string, target_ast>,
        output?: Record<string, target_ast>
        return?: target_ast
    }
}

/*
 * Converts a block call into ast
 */
export const callInterfaceToAst = (base: any): call_interface_ast => {
    const interfaceAst: call_interface_ast = {ty: "call_interface", src: {}};

    ['input', 'output', 'inout', 'static', 'return'].forEach(key => {
        if (key in base) {
            //@ts-expect-error TS2322
            interfaceAst.src[key as keyof call_interface_ast["src"]] = key === 'return'
                ? get_target_ast(base[key])
                : Object.fromEntries(
                    Object.keys(base[key])
                        .map(subKey => [subKey, get_target_ast(base[key][subKey])])
                )
        }
    });

    return interfaceAst
}
