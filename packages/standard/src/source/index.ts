import {ExposeSource} from "@vifjs/language-builder/source";
import StdCompiler from "@/src/source/compiler";
import StdProvider from "@/src/source/provider";

export const Provider = StdProvider
export const BuildSource = ExposeSource(StdProvider, StdCompiler)

