import {
    Bool,
    Byte,
    DInt,
    DWord,
    Int,
    LInt,
    LReal,
    LWord,
    Real, 
    SInt,
    String as _String,
    WString,
    Char,
    WChar,
    UDInt,
    UInt,
    ULInt,
    USInt,
    Word,
    Time,
    Time_from,
    LTime,
    LTime_from,
    Tod,
    Tod_from,
    LTod,
    LTod_from,
} from "@/src/types/primitives/index.js";
import {describe, expect, it} from "vitest";

describe("Primitives", function () {
    describe("Bool", () => {
        it("Bool", () => {
            const TBool = new Bool(true)
            expect(TBool.value).to.be.equal(true)
        })
    })
    describe("String", () => {
        it("String", () => {
            const TString = new _String("StringValue")
            expect(TString.value).to.be.equal("StringValue")
        })
        it("WString", () => {
            const TString = new WString("StringValue")
            expect(TString.value).to.be.equal("StringValue")
        })
        it("Char", () => {
            const TString = new Char("A")
            expect(TString.value).to.be.equal("A")
        })
        it("WChar", () => {
            const TString = new WChar("A")
            expect(TString.value).to.be.equal("A")
        })
    })
    describe("Binaries", () => {
        it("Byte", () => {
            const TByte = new Byte(0x8)
            expect(TByte.value).to.be.equal(0x8)
        })
        it("Word", () => {
            const TWord = new Word(0x8)
            expect(TWord.value).to.be.equal(0x8)
        })
        it("DWord", () => {
            const TDWord = new DWord(0x8)
            expect(TDWord.value).to.be.equal(0x8)
        })
        it("LWord", () => {
            const TLWord = new LWord(0x8)
            expect(TLWord.value).to.be.equal(0x8)
        })
        it("BigInt LWord", () => {
            const TLWord = new LWord(BigInt(1654484894))
            expect(TLWord.value).to.be.equal("1654484894")
        })
    })
    describe("Integers", () => {
        it("SInt", () => {
            const TSInt = new SInt(0x8)
            expect(TSInt.value).to.be.equal(0x8)
        })
        it("USInt", () => {
            const TSInt = new USInt(0x8)
            expect(TSInt.value).to.be.equal(0x8)
        })
        it("Int", () => {
            const TInt = new Int(0x8)
            expect(TInt.value).to.be.equal(0x8)
        })
        it("UInt", () => {
            const TInt = new UInt(0x8)
            expect(TInt.value).to.be.equal(0x8)
        })
        it("ULInt", () => {
            const TSInt = new ULInt(0x8)
            expect(TSInt.value).to.be.equal(0x8)
        })
        it("DInt", () => {
            const TDInt = new DInt(0x8)
            expect(TDInt.value).to.be.equal(0x8)
        })
        it("UDInt", () => {
            const TDInt = new UDInt(0x8)
            expect(TDInt.value).to.be.equal(0x8)
        }) 
        it("LInt", () => {
            const TLInt = new LInt(0x8)
            expect(TLInt.value).to.be.equal(0x8)
        })
        it("BigInt LInt", () => {
            const TLInt = new LInt(BigInt(16546546845465))
            expect(TLInt.value).to.be.equal("16546546845465")
        })
        it("ULInt", () => {
            const TLInt = new ULInt(0x8)
            expect(TLInt.value).to.be.equal(0x8)
        })
        it("BigInt ULInt", () => {
            const TLInt = new ULInt(BigInt(16546546845465))
            expect(TLInt.value).to.be.equal("16546546845465")
        })
    })
    describe("Floats", () => {
        it("Real", () => {
            const TReal = new Real(3.545647)
            expect(TReal.value).to.be.equal(3.545647)
        })
        it("LReal", () => {
            const TLReal = new LReal(0.5)
            expect(TLReal.value).to.be.equal(0.5)
        })
        it("BigInt LReal", () => {
            const TLReal = new LReal(0.25988446698784)
            expect(TLReal.value).to.be.equal(0.25988446698784)
        })
    })
    describe("Time", () => {
        it("Time", () => {
            const TTime = new Time(5000)
            expect(TTime.value).to.be.equal(5000)
            expect(TTime.toString()).to.be.equal("T#5S")
        })
        it("Negative Time", () => {
            const TTime = new Time(-2000)
            expect(TTime.value).to.be.equal(-2000)
            expect(TTime.toString()).to.be.equal("T#-2S")
        })
        it("TimeFrom", () => {
            const TTime = Time_from({d: 10, h: 12, m: 50, s: 52, ms: 20})
            expect(TTime.toString()).to.be.equal("T#10D_12H_50M_52S_20MS")
        })
        it("Negative TimeFrom", () => {
            const TTime = Time_from({ negative: true, d: 10, h: 12, m: 50, s: 52, ms: 20})
            expect(TTime.toString()).to.be.equal("T#-10D_12H_50M_52S_20MS")
        })
        it("LTime", () => {
            const TLTime = new LTime(5000)
            expect(TLTime.value).to.be.equal(5000)
        })
        it("Negative LTime", () => {
            const TTime = new LTime(-2000)
            expect(TTime.value).to.be.equal(-2000)
            expect(TTime.toString()).to.be.equal("LT#-2US")
        })
        it("LTimeFrom", () => {
            const TLTime = LTime_from({d: 10, h: 12, m: 50, s: 52, ms: 20, us: 10, ns: 20})
            expect(TLTime.toString()).to.be.equal("LT#10D_12H_50M_52S_20MS_10US_20NS")
        })
        it("Negative LTimeFrom", () => {
            const TTime = LTime_from({negative: true, d: 10, h: 12, m: 50, s: 52, ms: 20, us: 10, ns: 20})
            expect(TTime.toString()).to.be.equal("LT#-10D_12H_50M_52S_20MS_10US_20NS")
        })
    })
    describe("Tod", () => {
        it("Tod", () => {
            const TTod = new Tod(5000)
            expect(TTod.value).to.be.equal(5000)
            expect(TTod.toString()).to.be.equal("TOD#00:00:05")
        })
        it("Tod from", () => {
            const TTOd = Tod_from({h: 12, m: 50, s: 52, ms: 20})
            expect(TTOd.toString()).to.be.equal("TOD#12:50:52.0020")
        })
        it("LTod", () => {
            const TTod = new LTod(5000)
            expect(TTod.value).to.be.equal(5000)
            expect(TTod.toString()).to.be.equal("LTOD#00:00:00.000005000")

            const TTod2 = new LTod(11458924878587)
            expect(TTod2.value).to.be.equal(11458924878587)
            expect(TTod2.toString()).to.be.equal("LTOD#03:10:58.924878587")
        })
        it("LTod from", () => {
            const TTod = LTod_from({h: 12, m: 50, s: 52, ns: 20})
            expect(TTod.toString()).to.be.equal("LTOD#12:50:52.000000020")
        })
    })
})