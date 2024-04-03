import {ExposeFb, ExposeFc, ExposeGlobalDb, ExposeInstanceDb, ExposeUdt} from "@vifjs/language-builder/pou";
export {Ob} from "@vifjs/language-builder/pou"

/*
 * https://vif.adclz.net/en/language/pou#fb
 */
export const Fb = ExposeFb<{
    s7oa?: boolean,
    version?: number
}>()

/*
 * https://vif.adclz.net/en/language/pou#fc
 */
export const Fc = ExposeFc<{
    s7oa?: boolean,
    version?: number
}>()

/*
 * https://vif.adclz.net/en/language/pou#udt
 */
export const Udt = ExposeUdt<{
    s7oa?: boolean,
    version?: number
}, {}>()

/*
 * https://vif.adclz.net/en/language/pou#globaldb
 */
export const GlobalDb = ExposeGlobalDb<{
    s7oa?: boolean,
    version?: number
}>()

/*
 * https://vif.adclz.net/en/language/pou#instancedb
 */
export const InstanceDb = ExposeInstanceDb<{
    s7oa?: boolean,
    version?: number
}>()