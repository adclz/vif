import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {GlobalDb, Ob} from "#pou";

import {BuildSource, Provider} from "#source";
import {
    Bool,
    Byte,
    Char,
    DInt,
    DWord,
    Int,
    LInt,
    LReal,
    LTime,
    LWord,
    Real,
    SInt,
    String as _String,
    Time,
    Tod,
    UDInt,
    UInt,
    ULInt,
    USInt,
    WChar,
    Word,
    WString
} from "#primitives";

const TestProgram = () => {
    const globalDb = new GlobalDb({
        test_bool_default: new Bool(),
        test_bool: new Bool(true),

        test_byte_default: new Byte(),
        test_byte: new Byte(8),
        test_word_default: new Word(),
        test_word: new Word(8),
        test_dword_default: new DWord(),
        test_dword: new DWord(8),
        test_lword_default: new LWord(),
        test_lword: new LWord(8),
        test_lword_bigint: new LWord(BigInt(6164498749)),

        test_sint_default: new SInt(),
        test_sint: new SInt(8),
        test_usint_default: new USInt(),
        test_usint: new USInt(8),
        test_int_default: new Int(),
        test_int: new Int(8),
        test_uint_default: new UInt(),
        test_uint: new UInt(8),
        test_dint_default: new DInt(),
        test_dint: new DInt(8),
        test_udint_default: new UDInt(),
        test_udint: new UDInt(8),
        test_lint_default: new LInt(),
        test_lint: new LInt(8),
        test_lint_bigint: new LInt(BigInt(6164498749)),
        test_ulint_default: new ULInt(),
        test_ulint: new ULInt(8),
        test_ulint_bigint: new ULInt(BigInt(6164498749)),

        test_real_default: new Real(),
        test_real: new Real(1.5),
        test_lreal_default: new LReal(),
        test_lreal: new LReal(1.5),

        test_time_default: new Time(),
        test_time: new Time(5000),
        test_ltime_default: new LTime(),
        test_ltime: new LTime(5000),

        test_tod_default: new Tod(),
        test_tod: new Tod(5000),

        test_string_default: new _String(),
        test_string: new _String("azerty"),
        test_wstring_default: new WString(),
        test_wstring: new WString("azerty"),
        test_char_default: new Char(),
        test_char: new Char("a"),
        test_wchar_default: new WChar(),
        test_wchar: new WChar("a"),
    })
    const ob = new Ob({})
    return BuildSource({
            blocks: {
                "Main": ob,
                "Db_default_values": globalDb
            }, monitor() {
                return [this.Db_default_values]
            }
        }
    )
}

describe("Simulation primitives", async () => {
    describe("Default Values", async () => {
        const container = new Container()
        await container.boot()
        const plugin = new Plugin("vitest", 200)
        plugin.on("messages", messages => {
            messages.forEach(x => console.log(x))
        })

        plugin.on("warnings", warnings => {
            console.log(warnings)
        })

        const getExecutor = await plugin.getAsyncExecutor().init(container)

        const program = TestProgram()
        await getExecutor.loadProvider(Provider.toAst())
        await getExecutor.loadProgram(program.toAst())
        const monitorSchemas = getExecutor.getMonitorSchemasAsObject()
        it("Bool", () => {
            expect(monitorSchemas["Db_default_values"]["test_bool_default"].value).to.be.equal("false")
            expect(monitorSchemas["Db_default_values"]["test_bool"].value).to.be.equal("true")
        })
        describe("Binaries", () => {
            it("Byte", () => {
                expect(monitorSchemas["Db_default_values"]["test_byte_default"].value).to.be.equal("0")
                expect(monitorSchemas["Db_default_values"]["test_byte"].value).to.be.equal("8")
            })
            it("Word", () => {
                expect(monitorSchemas["Db_default_values"]["test_word_default"].value).to.be.equal("0")
                expect(monitorSchemas["Db_default_values"]["test_word"].value).to.be.equal("8")
            })
            it("DWord", () => {
                expect(monitorSchemas["Db_default_values"]["test_dword_default"].value).to.be.equal("0")
                expect(monitorSchemas["Db_default_values"]["test_dword"].value).to.be.equal("8")
            })
            it("LWord", () => {
                expect(monitorSchemas["Db_default_values"]["test_lword_default"].value).to.be.equal("0")
                expect(monitorSchemas["Db_default_values"]["test_lword"].value).to.be.equal("8")
            })
            it("LWord BigInt", () => {
                expect(monitorSchemas["Db_default_values"]["test_lword_bigint"].value).to.be.equal("6164498749")
            })
        })
        describe("Integers", () => {
            it("SInt", () => {
                expect(monitorSchemas["Db_default_values"]["test_sint_default"].value).to.be.equal("0")
                expect(monitorSchemas["Db_default_values"]["test_sint"].value).to.be.equal("8")
            })
            it("USInt", () => {
                expect(monitorSchemas["Db_default_values"]["test_usint_default"].value).to.be.equal("0")
                expect(monitorSchemas["Db_default_values"]["test_usint"].value).to.be.equal("8")
            })
            it("Int", () => {
                expect(monitorSchemas["Db_default_values"]["test_int_default"].value).to.be.equal("0")
                expect(monitorSchemas["Db_default_values"]["test_int"].value).to.be.equal("8")
            })
            it("UInt", () => {
                expect(monitorSchemas["Db_default_values"]["test_uint_default"].value).to.be.equal("0")
                expect(monitorSchemas["Db_default_values"]["test_uint"].value).to.be.equal("8")
            })
            it("DInt", () => {
                expect(monitorSchemas["Db_default_values"]["test_dint_default"].value).to.be.equal("0")
                expect(monitorSchemas["Db_default_values"]["test_dint"].value).to.be.equal("8")
            })
            it("UDInt", () => {
                expect(monitorSchemas["Db_default_values"]["test_udint_default"].value).to.be.equal("0")
                expect(monitorSchemas["Db_default_values"]["test_udint"].value).to.be.equal("8")
            })
            it("LInt", () => {
                expect(monitorSchemas["Db_default_values"]["test_lint_default"].value).to.be.equal("0")
                expect(monitorSchemas["Db_default_values"]["test_lint"].value).to.be.equal("8")
            })
            it("LInt BigInt", () => {
                expect(monitorSchemas["Db_default_values"]["test_lint_bigint"].value).to.be.equal("6164498749")
            })
            it("ULInt", () => {
                expect(monitorSchemas["Db_default_values"]["test_ulint_default"].value).to.be.equal("0")
                expect(monitorSchemas["Db_default_values"]["test_ulint"].value).to.be.equal("8")
            })
            it("ULInt BigInt", () => {
                expect(monitorSchemas["Db_default_values"]["test_ulint_bigint"].value).to.be.equal("6164498749")
            })
        })
        describe("Floats", () => {
            it("Real", () => {
                expect(monitorSchemas["Db_default_values"]["test_real_default"].value).to.be.equal("0.0")
                expect(monitorSchemas["Db_default_values"]["test_real"].value).to.be.equal("1.5")
            })
            it("LReal", () => {
                expect(monitorSchemas["Db_default_values"]["test_lreal_default"].value).to.be.equal("0.0")
                expect(monitorSchemas["Db_default_values"]["test_lreal"].value).to.be.equal("1.5")
            })
        })
        describe("Time", () => {
            it("Time", () => {
                expect(monitorSchemas["Db_default_values"]["test_time_default"].value).to.be.equal("0")
                expect(monitorSchemas["Db_default_values"]["test_time"].value).to.be.equal("5000")
            })
            it("LTime", () => {
                expect(monitorSchemas["Db_default_values"]["test_ltime_default"].value).to.be.equal("0")
                expect(monitorSchemas["Db_default_values"]["test_ltime"].value).to.be.equal("5000")
            })
        })
        describe("Tod", () => {
            it("Tod", () => {
                expect(monitorSchemas["Db_default_values"]["test_tod_default"].value).to.be.equal("0")
                expect(monitorSchemas["Db_default_values"]["test_tod"].value).to.be.equal("5000")
            })
        })
        describe("String", () => {
            it("String", () => {
                expect(monitorSchemas["Db_default_values"]["test_string_default"].value).to.be.equal("")
                expect(monitorSchemas["Db_default_values"]["test_string"].value).to.be.equal("azerty")
            })
            it("WString", () => {
                expect(monitorSchemas["Db_default_values"]["test_wstring_default"].value).to.be.equal("")
                expect(monitorSchemas["Db_default_values"]["test_wstring"].value).to.be.equal("azerty")
            })
            it("Char", () => {
                expect(monitorSchemas["Db_default_values"]["test_char_default"].value).to.be.equal("'\\0'")
                expect(monitorSchemas["Db_default_values"]["test_char"].value).to.be.equal("\'a\'")
            })
            it("WChar", () => {
                expect(monitorSchemas["Db_default_values"]["test_wchar_default"].value).to.be.equal("'\\0'")
                expect(monitorSchemas["Db_default_values"]["test_wchar"].value).to.be.equal("\'a\'")
            })
        })
        describe("Compiler output", () => {
            const output = program.compileProgram()
            it("output", () => {
                Object.values(output)
                    .forEach(x => console.log(x.join("\n")))
                expect(output["file:///Db_default_values"]).to.toMatchObject([
                    "DATA_BLOCK \"Db_default_values\"",
                    "{ S7_Optimized_Access := 'TRUE' }",
                    "VERSION : 0.1",
                    "\tVAR",
                    "\t\ttest_bool_default : Bool;",
                    "\t\ttest_bool : Bool;",
                    "\t\ttest_byte_default : Byte;",
                    "\t\ttest_byte : Byte;",
                    "\t\ttest_word_default : Word;",
                    "\t\ttest_word : Word;",
                    "\t\ttest_dword_default : DWord;",
                    "\t\ttest_dword : DWord;",
                    "\t\ttest_lword_default : LWord;",
                    "\t\ttest_lword : LWord;",
                    "\t\ttest_lword_bigint : LWord;",
                    "\t\ttest_sint_default : SInt;",
                    "\t\ttest_sint : SInt;",
                    "\t\ttest_usint_default : USInt;",
                    "\t\ttest_usint : USInt;",
                    "\t\ttest_int_default : Int;",
                    "\t\ttest_int : Int;",
                    "\t\ttest_uint_default : UInt;",
                    "\t\ttest_uint : UInt;",
                    "\t\ttest_dint_default : DInt;",
                    "\t\ttest_dint : DInt;",
                    "\t\ttest_udint_default : UDInt;",
                    "\t\ttest_udint : UDInt;",
                    "\t\ttest_lint_default : LInt;",
                    "\t\ttest_lint : LInt;",
                    "\t\ttest_lint_bigint : LInt;",
                    "\t\ttest_ulint_default : ULInt;",
                    "\t\ttest_ulint : ULInt;",
                    "\t\ttest_ulint_bigint : ULInt;",
                    "\t\ttest_real_default : Real;",
                    "\t\ttest_real : Real;",
                    "\t\ttest_lreal_default : LReal;",
                    "\t\ttest_lreal : LReal;",
                    "\t\ttest_time_default : Time;",
                    "\t\ttest_time : Time;",
                    "\t\ttest_ltime_default : LTime;",
                    "\t\ttest_ltime : LTime;",
                    "\t\ttest_tod_default : Tod;",
                    "\t\ttest_tod : Tod;",
                    "\t\ttest_string_default : String;",
                    "\t\ttest_string : String;",
                    "\t\ttest_wstring_default : WString;",
                    "\t\ttest_wstring : WString;",
                    "\t\ttest_char_default : Char;",
                    "\t\ttest_char : Char;",
                    "\t\ttest_wchar_default : WChar;",
                    "\t\ttest_wchar : WChar;",
                    "\tEND_VAR",
                    "",
                    "BEGIN",
                    "\ttest_bool := true;",
                    "\ttest_byte := 16#8;",
                    "\ttest_word := 16#8;",
                    "\ttest_dword := 16#8;",
                    "\ttest_lword := 16#8;",
                    "\ttest_lword_bigint := 16#16F6EC93D;",
                    "\ttest_sint := 8;",
                    "\ttest_usint := 8;",
                    "\ttest_int := 8;",
                    "\ttest_uint := 8;",
                    "\ttest_dint := 8;",
                    "\ttest_udint := 8;",
                    "\ttest_lint := 8;",
                    "\ttest_lint_bigint := 6164498749;",
                    "\ttest_ulint := 8;",
                    "\ttest_ulint_bigint := 6164498749;",
                    "\ttest_real := 1.5;",
                    "\ttest_lreal := 1.5;",
                    "\ttest_time := T#5S;",
                    "\ttest_ltime := LT#5US;",
                    "\ttest_tod := TOD#00:00:05;",
                    "\ttest_string := 'azerty';",
                    "\ttest_wstring := WSTRING#'azerty';",
                    "\ttest_char := 'a';",
                    "\ttest_wchar := WCHAR#'a';",
                    "",
                    "END_DATA_BLOCK",
                    ""
                ])
            })
        })
    })
})
