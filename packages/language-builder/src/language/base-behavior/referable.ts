import {Primitive} from "@/src/types/primitives/primitives.js";
import {Array_} from "@/src/types/complex/array.js";
import {UdtImpl} from "@/src/pou/udt.js";
import {_Struct} from "@/src/types/complex/struct.js";
import {_Instance} from "@/src/types/complex/instance.js";

export interface Referable {
    // If global ref (Udt, fc, fb)
    __global?: {ty: 'global', path: string[]},
    // Interface
    __local?: {parent?: any, ty?: 'local' | 'global', path: string[]}
    // Parent (Udt, fc, fb) of the entity
    // Mostly used by instructions to check if their parameters are still in the same block
    __parent?: any
}

/*
 * Injects a local reference in all variables.
 * 
 * When the program gets compiled, the get_target_ast function will read the "__local" field if this one refers to a local reference.
 * 
 * The parent can be anything, but if the reference belongs the calling block, it will be "self".
 */
export const injectLocalRef = (block: any, parent: any = "local") => {
    for (const section in block) {
        if (section === "return") {
            injectLocal(block["return"], parent, "return")
        }
        for (const member in block[section]) {
            injectLocal(block[section][member], parent, member)
        }
    }
}

export const injectLocalInMembers = (member: any, parent: any = "local") => {
    for (const x in member) {
        injectLocal(member[x], parent, x)
    }
}

const injectLocal = (item: any, parent: any, member: any) => {
    switch (true) {
        case item instanceof Primitive:
            item["__local"] = {parent, path: [member]}
            break;
        case item instanceof Array_: {
            item["__local"] = {parent, path: [member]};
            item.injectLocalRefs(parent, [member]);
        }
            break;
        case item instanceof UdtImpl: {
            item["__local"] = {parent, path: [member]};
            item.injectLocalRefs(parent, [member])
            break;
        }
        case item instanceof _Struct: {
            item["__local"] = {parent, path: [member]};
            item.injectLocalRefs(parent, [member])
            break;
        }
        case item instanceof _Instance: {
            item["__local"] = {parent, path: [member]};
            item.injectLocalRefs(parent, [member])
            break;
        }
    }
}