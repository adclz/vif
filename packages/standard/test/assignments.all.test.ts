import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {BuildSource, Provider} from "#source";
import {Fb, InstanceDb, Ob} from "#pou";
import {UnitTest} from "#unit";
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
    LTime_from,
    LWord,
    Real,
    SInt,
    String as _String,
    Time,
    Time_from,
    UDInt,
    UInt,
    ULInt,
    USInt,
    WChar,
    Word,
    WString
} from "#primitives";
import {UnitTestStatus} from "@vifjs/sim-node";
import {Assign, Call} from "#basics";

const TestProgram = () => {
    const fb = new Fb({
            interface: {
                temp: {
                    test_bool: new Bool(false),

                    test_byte: new Byte(),
                    test_word: new Word(),
                    test_dword: new DWord(),
                    test_lword: new LWord(),
                    test_lword_bigint: new LWord(),

                    test_sint: new SInt(),
                    test_usint: new USInt(),
                    test_int: new Int(),
                    test_uint: new UInt(),
                    test_dint: new DInt(),
                    test_udint: new UDInt(),
                    test_lint: new LInt(),
                    test_lint_bigint: new LInt(),
                    test_ulint: new ULInt(),
                    test_ulint_bigint: new ULInt(),

                    test_real: new Real(),
                    test_lreal: new LReal(),

                    test_time: new Time(),
                    test_ltime: new LTime(),

                    test_string: new _String(),
                    test_wstring: new WString(),
                    test_char: new Char(),
                    test_wchar: new WChar(),
                }
            }, body() {
                return [
                    new Assign(this.temp.test_bool, true),
                    new UnitTest("Bool assign", this.temp.test_bool, "=", true),

                    new Assign(this.temp.test_byte, 8),
                    new UnitTest("Byte assign", this.temp.test_byte, "=", 8),
                    new Assign(this.temp.test_word, 8),
                    new UnitTest("Word assign", this.temp.test_word, "=", 8),
                    new Assign(this.temp.test_dword, 8),
                    new UnitTest("DWord assign", this.temp.test_dword, "=", 8),
                    new Assign(this.temp.test_lword, 8),
                    new UnitTest("LWord assign", this.temp.test_lword, "=", 8),

                    new Assign(this.temp.test_usint, 8),
                    new UnitTest("USInt assign", this.temp.test_usint, "=", 8),
                    new Assign(this.temp.test_sint, 8),
                    new UnitTest("SInt assign", this.temp.test_sint, "=", 8),
                    new Assign(this.temp.test_uint, 8),
                    new UnitTest("UInt assign", this.temp.test_uint, "=", 8),
                    new Assign(this.temp.test_int, 8),
                    new UnitTest("Int assign", this.temp.test_int, "=", 8),
                    new Assign(this.temp.test_udint, 8),
                    new UnitTest("UDInt assign", this.temp.test_udint, "=", 8),
                    new Assign(this.temp.test_dint, new DInt(8)),
                    new UnitTest("DInt assign", this.temp.test_dint, "=", 8),
                    new Assign(this.temp.test_ulint, 8),
                    new UnitTest("ULInt assign", this.temp.test_ulint, "=", 8),
                    new Assign(this.temp.test_lint, 8),
                    new UnitTest("LInt assign", this.temp.test_lint, "=", 8),

                    new Assign(this.temp.test_real, 0.9),
                    new UnitTest("Real assign", this.temp.test_real, "=", 0.9),
                    new Assign(this.temp.test_lreal, 0.9),
                    new UnitTest("Real assign", this.temp.test_lreal, "=", 0.9),

                    new Assign(this.temp.test_time, Time_from({s: 5, ms: 5})),
                    new UnitTest("Time assign", this.temp.test_time, "=", Time_from({s: 5, ms: 5})),
                    new Assign(this.temp.test_ltime, LTime_from({s: 5, ms: 5})),
                    new UnitTest("LTime assign", this.temp.test_ltime, "=", LTime_from({s: 5, ms: 5})),

                    new Assign(this.temp.test_string, "azerty"),
                    new UnitTest("String assign", this.temp.test_string, "=", "azerty"),
                    new Assign(this.temp.test_wstring, "azerty"),
                    new UnitTest("WString assign", this.temp.test_wstring, "=", "azerty"),
                    new Assign(this.temp.test_char, "a"),
                    new UnitTest("Char assign", this.temp.test_char, "=", "a"),
                    new Assign(this.temp.test_wchar, "a"),
                    new UnitTest("WChar assign", this.temp.test_wchar, "=", "a"),
                ]
            }
        }
    )

    const fbInstance = new InstanceDb(fb)

    return BuildSource({
        blocks: {
            "Main": new Ob(
                {
                    body() {
                        return [new Call(fbInstance, {})]
                    }
                }
            ),
            "Assign_Fb": fb,
            "Assign_Instance": fbInstance
        }
    })
}

describe("Simulation primitives", async () => {
    describe("Assign Values", async () => {
        describe("Simulation tests", async () => {
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

            await getExecutor.loadProvider(Provider.toAst());
            await getExecutor.loadProgram(program.toAst());
            const tests = await getExecutor.startAndWaitUnitTests("Main")
            tests.forEach(test => {
                it(test.description, () => {
                    console.log(JSON.stringify(program.toAst()))
                    expect(test.status, test.fail_message + "\n")
                        .to.be.equal(UnitTestStatus.Succeed)
                })
            })
            describe("Compiler output", () => {
                const output = program.compileProgram()
                it("output", () => {
                    Object.values(output)
                        .forEach(x => console.log(x.join("\n")))
                    expect(output["file:///Assign_Fb"]).to.toMatchObject([
                        "FUNCTION_BLOCK \"Assign_Fb\"",
                        "	VAR_TEMP",
                        "		test_bool : Bool;",
                        "		test_byte : Byte;",
                        "		test_word : Word;",
                        "		test_dword : DWord;",
                        "		test_lword : LWord;",
                        "		test_lword_bigint : LWord;",
                        "		test_sint : SInt;",
                        "		test_usint : USInt;",
                        "		test_int : Int;",
                        "		test_uint : UInt;",
                        "		test_dint : DInt;",
                        "		test_udint : UDInt;",
                        "		test_lint : LInt;",
                        "		test_lint_bigint : LInt;",
                        "		test_ulint : ULInt;",
                        "		test_ulint_bigint : ULInt;",
                        "		test_real : Real;",
                        "		test_lreal : LReal;",
                        "		test_time : Time;",
                        "		test_ltime : LTime;",
                        "		test_string : String;",
                        "		test_wstring : WString;",
                        "		test_char : Char;",
                        "		test_wchar : WChar;",
                        "	END_VAR",
                        "BEGIN",
                        "	test_bool := true;",
                        "	test_byte := 8;",
                        "	test_word := 8;",
                        "	test_dword := 8;",
                        "	test_lword := 8;",
                        "	test_usint := 8;",
                        "	test_sint := 8;",
                        "	test_uint := 8;",
                        "	test_int := 8;",
                        "	test_udint := 8;",
                        "	test_dint := DInt := 8;",
                        "	test_ulint := 8;",
                        "	test_lint := 8;",
                        "	test_real := 0.9;",
                        "	test_lreal := 0.9;",
                        "	test_time := Time := T#5S_5MS;",
                        "	test_ltime := LTime := LT#5S_5MS;",
                        "	test_string := azerty;",
                        "	test_wstring := azerty;",
                        "	test_char := a;",
                        "	test_wchar := a;",
                        "",
                        "END_FUNCTION_BLOCK",
                    ])
                })
            })
        })
    })
})
