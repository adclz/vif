import {describe, expect, it} from "vitest";
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
import {Fb, InstanceDb, Ob} from "#pou";

import {BuildSource, Provider} from "#source";
import {UnitTest} from "#unit";
import {
    Byte,
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
    Time,
    Time_from,
    UDInt,
    UInt,
    ULInt,
    USInt,
    Word
} from "#primitives";
import {UnitTestStatus} from "@vifjs/sim-node";
import {Assign, Calc, Call} from "#basics";

const TestProgram = () => {
    const fb = new Fb({
            interface: {
                temp: {
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

                    test_real: new Real(0.9),
                    test_lreal: new LReal(0.9),

                    test_time: new Time(),
                    test_ltime: new LTime()
                }
            },
            body() {
                return [
                    new Assign(this.temp.test_byte, new Calc(this.temp.test_byte, "+", 8)),
                    new UnitTest("Byte add", this.temp.test_byte, "=", 8),

                    new Assign(this.temp.test_word, new Calc(this.temp.test_word, "+", 8)),
                    new UnitTest("Word add", this.temp.test_word, "=", 8),
                    new Assign(this.temp.test_dword, new Calc(this.temp.test_dword, "+", 8)),
                    new UnitTest("DWord add", this.temp.test_dword, "=", 8),
                    new Assign(this.temp.test_lword, new Calc(this.temp.test_lword, "+", 8)),
                    new UnitTest("LWord add", this.temp.test_lword, "=", 8),

                    new Assign(this.temp.test_usint, new Calc(this.temp.test_usint, "+", 8)),
                    new UnitTest("USInt add", this.temp.test_usint, "=", 8),
                    new Assign(this.temp.test_sint, new Calc(this.temp.test_sint, "+", 8)),
                    new UnitTest("SInt add", this.temp.test_sint, "=", 8),
                    new Assign(this.temp.test_uint, new Calc(this.temp.test_uint, "+", 8)),
                    new UnitTest("UInt add", this.temp.test_uint, "=", 8),
                    new Assign(this.temp.test_int, new Calc(this.temp.test_int, "+", 8)),
                    new UnitTest("Int add", this.temp.test_int, "=", 8),
                    new Assign(this.temp.test_udint, new Calc(this.temp.test_udint, "+", 8)),
                    new UnitTest("UDInt add", this.temp.test_udint, "=", 8),
                    new Assign(this.temp.test_dint, new Calc(this.temp.test_dint, "+", 8)),
                    new UnitTest("DInt add", this.temp.test_dint, "=", 8),
                    new Assign(this.temp.test_ulint, new Calc(this.temp.test_ulint, "+", 8)),
                    new UnitTest("ULInt add", this.temp.test_ulint, "=", 8),
                    new Assign(this.temp.test_lint, new Calc(this.temp.test_lint, "+", 8)),
                    new UnitTest("LInt add", this.temp.test_lint, "=", 8),

                    new Assign(this.temp.test_real, new Calc(this.temp.test_real, "+", 0.9)),
                    new UnitTest("Real assign", this.temp.test_real, "=", 1.8),
                    new Assign(this.temp.test_lreal, new Calc(this.temp.test_lreal, "+", 0.9)),
                    new UnitTest("Real assign", this.temp.test_lreal, "=", 1.8),

                    new Assign(this.temp.test_time, new Calc(this.temp.test_time, "+", Time_from({s: 5, ms: 5}))),
                    new UnitTest("Time assign", this.temp.test_time, "=", Time_from({s: 5, ms: 5})),
                    new Assign(this.temp.test_ltime, new Calc(this.temp.test_ltime, "+", LTime_from({s: 5, ms: 5}))),
                    new UnitTest("LTime assign", this.temp.test_ltime, "=", LTime_from({s: 5, ms: 5})),
                ]
            }
        }
    )

    const fbInstance = new InstanceDb(fb)

    return BuildSource({
        blocks:
            {
                "Main": new Ob(
                    {
                        body() {
                            return [new Call(fbInstance, {})]
                        }
                    }
                ),
                "Add_Fb": fb,
                "Add_Fb_Instance": fbInstance
            }
    })
}

describe("Simulation primitives", async () => {
    describe("Add Values += 8", async () => {
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
                    expect(test.status, test.fail_message + "\n")
                        .to.be.equal(UnitTestStatus.Succeed)
                })
            })
            describe("Compiler output", () => {
                const output = program.compileProgram()
                it("output", () => {
                    Object.values(output)
                        .forEach(x => console.log(x.join("\n")))
                    expect(output["file:///Add_Fb"]).to.toMatchObject([
                        "FUNCTION_BLOCK \"Add_Fb\"",

                        "	VAR_TEMP",
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
                        "		test_real : Real := 0.9;",
                        "		test_lreal : LReal := 0.9;",
                        "		test_time : Time;",
                        "		test_ltime : LTime;",
                        "	END_VAR",
                        "BEGIN",
                        "	test_byte := test_byte + 8;",
                        "	test_word := test_word + 8;",
                        "	test_dword := test_dword + 8;",
                        "	test_lword := test_lword + 8;",
                        "	test_usint := test_usint + 8;",
                        "	test_sint := test_sint + 8;",
                        "	test_uint := test_uint + 8;",
                        "	test_int := test_int + 8;",
                        "	test_udint := test_udint + 8;",
                        "	test_dint := test_dint + 8;",
                        "	test_ulint := test_ulint + 8;",
                        "	test_lint := test_lint + 8;",
                        "	test_real := test_real + 0.9;",
                        "	test_lreal := test_lreal + 0.9;",
                        "	test_time := test_time + T#5S_5MS;",
                        "	test_ltime := test_ltime + LT#5S_5MS;",
                        "",
                        "END_FUNCTION_BLOCK",
                    ])
                })
            })
        })
    })
})
