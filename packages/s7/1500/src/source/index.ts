import {ExposeSource} from "@vifjs/language-builder/source";
import Compiler1200 from "@/src/source/compiler";
import Provider1200 from "@/src/source/provider";

export const Provider = Provider1200
export const BuildSource = ExposeSource(Provider1200, Compiler1200)

