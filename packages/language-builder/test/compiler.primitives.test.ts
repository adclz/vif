import {Compiler} from "@/src/source/index.js";
import {describe, expect, it} from "vitest";
import {Tod_from} from "@/src/types/primitives/tod/Tod.js";
import {LTod_from} from "@/src/types/primitives/tod/LTod.js";
import {Time_from} from "@/src/types/primitives/time/Time.js";
import {LTime_from} from "@/src/types/primitives/time/LTime.js";

const compiler = new Compiler()
compiler.useDefaultTransformers()

describe("Compiler", function () {
    describe("Compiler default primitives transformers", () => {
        it("Bool", () => {
            const bool = compiler.emit("bool", {ty: "Bool", src: {value: true}}, compiler, {})
            expect(bool).toMatchObject(["true"])
        })
        describe("Binaries", () => {
            it("Byte", () => {
                const byte = compiler.emit("byte", {ty: "Byte", src: {value: 10}}, compiler, {})
                expect(byte).toMatchObject(["16#A"])
            })
            it("Explicit Byte", () => {
                const byte = compiler.emit("byte", {ty: "Byte", src: {value: 10}}, compiler, { asTypedConstant: true })
                expect(byte).toMatchObject(["BYTE#16#A"])
            })
            it("Word", () => {
                const word = compiler.emit("word", {ty: "Word", src: {value: 10}}, compiler, {})
                expect(word).toMatchObject(["16#A"])
            })
            it("Explicit Word", () => {
                const byte = compiler.emit("word", {ty: "Word", src: {value: 10}}, compiler, { asTypedConstant: true })
                expect(byte).toMatchObject(["WORD#16#A"])
            })
            it("DWord", () => {
                const word = compiler.emit("dword", {ty: "DWord", src: {value: 10}}, compiler, {})
                expect(word).toMatchObject(["16#A"])
            })
            it("Explicit DWord", () => {
                const byte = compiler.emit("dword", {ty: "DWord", src: {value: 10}}, compiler, { asTypedConstant: true })
                expect(byte).toMatchObject(["DWORD#16#A"])
            })
            it("LWord", () => {
                const word = compiler.emit("lword", {ty: "LWord", src: {value: 10}}, compiler, {})
                expect(word).toMatchObject(["16#A"])
            })
            it("Explicit LWord", () => {
                const byte = compiler.emit("lword", {ty: "LWord", src: {value: 6164498749}}, compiler, { asTypedConstant: true })
                expect(byte).toMatchObject(["LWORD#16#16F6EC93D"])
            })
        })
        describe("Integers", () => {
            it("SInt", () => {
                const byte = compiler.emit("sint", {ty: "SInt", src: {value: 10}}, compiler, {})
                expect(byte).toMatchObject(["10"])
            })
            it("SInt Explicit", () => {
                const byte = compiler.emit("sint", {ty: "SInt", src: {value: 10}}, compiler, { asTypedConstant: true })
                expect(byte).toMatchObject(["SINT#10"])
            })
            it("USInt", () => {
                const word = compiler.emit("usint", {ty: "USInt", src: {value: 10}}, compiler, {})
                expect(word).toMatchObject(["10"])
            })
            it("USInt Explicit", () => {
                const word = compiler.emit("usint", {ty: "USInt", src: {value: 10}}, compiler, { asTypedConstant: true })
                expect(word).toMatchObject(["USINT#10"])
            })
            it("Int", () => {
                const word = compiler.emit("int", {ty: "Int", src: {value: 10}}, compiler, {})
                expect(word).toMatchObject(["10"])
            })
            it("Int Explicit", () => {
                const word = compiler.emit("int", {ty: "Int", src: {value: 10}}, compiler, { asTypedConstant: true })
                expect(word).toMatchObject(["INT#10"])
            })
            it("UInt", () => {
                const word = compiler.emit("uint", {ty: "UInt", src: {value: 10}}, compiler, {})
                expect(word).toMatchObject(["10"])
            })
            it("UInt Explicit", () => {
                const word = compiler.emit("uint", {ty: "UInt", src: {value: 10}}, compiler, { asTypedConstant: true })
                expect(word).toMatchObject(["UINT#10"])
            })
            it("DInt", () => {
                const word = compiler.emit("dint", {ty: "DInt", src: {value: 10}}, compiler, {})
                expect(word).toMatchObject(["10"])
            })
            it("DInt Explicit", () => {
                const word = compiler.emit("dint", {ty: "DInt", src: {value: 10}}, compiler, { asTypedConstant: true })
                expect(word).toMatchObject(["DINT#10"])
            })
            it("UDInt", () => {
                const word = compiler.emit("udint", {ty: "UDInt", src: {value: 10}}, compiler, {})
                expect(word).toMatchObject(["10"])
            })
            it("UDInt Explicit", () => {
                const word = compiler.emit("udint", {ty: "UDInt", src: {value: 10}}, compiler, { asTypedConstant: true })
                expect(word).toMatchObject(["UDINT#10"])
            })
            it("LInt", () => {
                const word = compiler.emit("lint", {ty: "LInt", src: {value: 10}}, compiler, {})
                expect(word).toMatchObject(["10"])
            })
            it("LInt Explicit", () => {
                const word = compiler.emit("lint", {ty: "LInt", src: {value: 10}}, compiler, { asTypedConstant: true })
                expect(word).toMatchObject(["LINT#10"])
            })
            it("LInt BigInt", () => {
                const word = compiler.emit("lint", {ty: "LInt", src: {value: "90071992547409910"}}, compiler, {})
                expect(word).toMatchObject(["90071992547409910"])
            })
            it("LInt BigInt Explicit", () => {
                const word = compiler.emit("lint", {ty: "LInt", src: {value: "90071992547409910"}}, compiler, { asTypedConstant: true })
                expect(word).toMatchObject(["LINT#90071992547409910"])
            })
            it("ULInt", () => {
                const word = compiler.emit("ulint", {ty: "ULInt", src: {value: 10}}, compiler, {})
                expect(word).toMatchObject(["10"])
            })
            it("ULInt", () => {
                const word = compiler.emit("ulint", {ty: "ULInt", src: {value: 10}}, compiler, { asTypedConstant: true })
                expect(word).toMatchObject(["ULINT#10"])
            })
            it("ULInt BigInt", () => {
                const word = compiler.emit("ulint", {ty: "ULInt", src: {value: "90071992547409910"}}, compiler, {})
                expect(word).toMatchObject(["90071992547409910"])
            })
            it("ULInt BigInt Explicit", () => {
                const word = compiler.emit("ulint", {ty: "ULInt", src: {value: "90071992547409910"}}, compiler, { asTypedConstant: true })
                expect(word).toMatchObject(["ULINT#90071992547409910"])
            })
        })
        describe("Floats", () => {
            it("Real", () => {
                const real = compiler.emit("real", {ty: "Real", src: {value: 0.154}}, compiler, {})
                expect(real).toMatchObject(["0.154"])
            })
            it("Real Explicit", () => {
                const real = compiler.emit("real", {ty: "Real", src: {value: 0.154}}, compiler, { asTypedConstant: true })
                expect(real).toMatchObject(["REAL#0.154"])
            })
            it("LReal", () => {
                const real = compiler.emit("lreal", {ty: "LReal", src: {value: 0.154}}, compiler, {})
                expect(real).toMatchObject(["0.154"])
            })
            it("LReal Explicit", () => {
                const real = compiler.emit("lreal", {ty: "LReal", src: {value: 0.154}}, compiler, { asTypedConstant: true })
                expect(real).toMatchObject(["LREAL#0.154"])
            })
            it("BigInt LReal", () => {
                const real = compiler.emit("lreal", {ty: "LReal", src: {value: 0.1456484646454}}, compiler, {})
                expect(real).toMatchObject(["0.1456484646454"])
            })
            it("BigInt LReal Explicit", () => {
                const real = compiler.emit("lreal", {ty: "LReal", src: {value: 0.1456484646454}}, compiler, { asTypedConstant: true })
                expect(real).toMatchObject(["LREAL#0.1456484646454"])
            })
        })
        describe("String", () => {
            it("String", () => {
                const string = compiler.emit("string", {ty: "String", src: {value: "Any string"}}, compiler, {})
                expect(string).toMatchObject(["\'Any string\'"])
            })
            it("String Explicit", () => {
                const string = compiler.emit("string", {ty: "String", src: {value: "Any string"}}, compiler, { asTypedConstant: true })
                expect(string).toMatchObject(["STRING#\'Any string\'"])
            })
            it("WString", () => {
                const string = compiler.emit("wstring", {ty: "WString", src: {value: "Any string"}}, compiler, {})
                expect(string).toMatchObject(["WSTRING#\'Any string\'"])
            })
            it("Char", () => {
                const string = compiler.emit("char", {ty: "Char", src: {value: "c"}}, compiler, {})
                expect(string).toMatchObject(["\'c\'"])
            })
            it("Char Explicit", () => {
                const string = compiler.emit("char", {ty: "Char", src: {value: "c"}}, compiler, { asTypedConstant: true })
                expect(string).toMatchObject(["CHAR#\'c\'"])
            })
            it("WChar", () => {
                const string = compiler.emit("wchar", {ty: "WChar", src: {value: "c"}}, compiler, {})
                expect(string).toMatchObject(["WCHAR#\'c\'"])
            })
        })
        describe("Time", () => {
            it("Time", () => {
                const string = compiler.emit("time", {ty: "Time", src: {value: 5000}}, compiler, {})
                expect(string).toMatchObject(["T#5S"])
            })
            it("Negative Time", () => {
                const string = compiler.emit("time", {ty: "Time", src: {value: -2598}}, compiler, {})
                expect(string).toMatchObject(["T#-2S_598MS"])
            })
            it("Time From", () => {
                const string = compiler.emit("time", {ty: "Time", src: {value: Time_from({s: 5}).value}}, compiler, {})
                expect(string).toMatchObject(["T#5S"])
            })
            it("LTime", () => {
                const string = compiler.emit("ltime", {ty: "LTime", src: {value: 5000}}, compiler, {})
                expect(string).toMatchObject(["LT#5US"])
            })
            it("Negative LTime", () => {
                const string = compiler.emit("ltime", {ty: "LTime", src: {value: -2598}}, compiler, {})
                expect(string).toMatchObject(["LT#-2US_598NS"])
            })
            it("LTime From", () => {
                const string = compiler.emit("ltime", {ty: "LTime", src: {value: LTime_from({s: 5}).value}}, compiler, {})
                expect(string).toMatchObject(["LT#5S"])
            })
        })
        describe("Tod", () => {
            it("Tod", () => {
                const string = compiler.emit("tod", {ty: "Tod", src: {value: 5000}}, compiler, {})
                expect(string).toMatchObject(["TOD#00:00:05"])
            })
            it("Tod From", () => {
                const string = compiler.emit("tod", {ty: "Tod", src: {value: Tod_from({s: 5}).value}}, compiler, {})
                expect(string).toMatchObject(["TOD#00:00:05"])
            })
            it("LTod", () => {
                const string = compiler.emit("ltod", {ty: "LTod", src: {value: 5000}}, compiler, {})
                expect(string).toMatchObject(["LTOD#:5000"])
            })
        })
    })
})