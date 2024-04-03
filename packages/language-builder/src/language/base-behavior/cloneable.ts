import {FbInterface} from "@/src/pou/fb.js";
import {FcInterface, GlobalDbInterface, InstanceDbInterface, ObInterface} from "@/src/pou/index.js";
import {InstanceInterface, StructInterface} from "@/src/types/complex/index.js";


export interface Cloneable {
    clone(): this
}

/*
 * Clone the interface of any block (assuming it has sections)
 */
export const cloneInterface = <T extends FbInterface | 
    FcInterface | 
    ObInterface |
    InstanceInterface | 
    InstanceDbInterface | 
    GlobalDbInterface>(base: Record<string, any>): T => {
    const cloned: T = {} as T;
    ['input', 'output', 'constant', 'inout', 'static', 'temp', 'return'].forEach(section => {
        if (base[section]) {
            //@ts-expect-error Could be anything
            cloned[section as keyof T] = Object.fromEntries(
                Object.keys(base[section])
                    .map(x => [x, base[section][x].clone()]) as any
            )
        }
    })
    return cloned
}

/*
 * Clone the members of any structured type (member of section, struct, udt)
 */
export const cloneMembers = <T extends StructInterface>(base: Record<string, any>): T => {
    const cloned = Object.fromEntries(
        Object.keys(base)
            .filter(x => typeof base[x] !== "undefined")
            .filter(x => typeof base[x]["clone"] !== "undefined")
            .map(x => [x, base[x].clone()])
    ) as T
    return cloned;
}