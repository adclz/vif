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
    LWord,
    Real,
    SInt,
    Time,
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
                test_byte: new Byte(7),
                test_word: new Word(7),
                test_dword: new DWord(7),
                test_lword: new LWord(7),
                test_lword_bigint: new LWord(7),

                test_sint: new SInt(7),
                test_usint: new USInt(7),
                test_int: new Int(7),
                test_uint: new UInt(7),
                test_dint: new DInt(7),
                test_udint: new UDInt(7),
                test_lint: new LInt(7),
                test_lint_bigint: new LInt(7),
                test_ulint: new ULInt(7),
                test_ulint_bigint: new ULInt(7),

                test_real: new Real(1.9),
                test_lreal: new LReal(1.9),

                test_time: new Time(5007),
                test_ltime: new Time(5007),
            }
        },
        body() {
            return [
                new Assign(this.temp.test_byte, new Calc(this.temp.test_byte, "MOD", 2)),
                new UnitTest("Byte mod", this.temp.test_byte, "=", 1),

                new Assign(this.temp.test_word, new Calc(this.temp.test_word, "MOD", 2)),
                new UnitTest("Word mod", this.temp.test_word, "=", 1),
                new Assign(this.temp.test_dword, new Calc(this.temp.test_dword, "MOD", 2)),
                new UnitTest("DWord mod", this.temp.test_dword, "=", 1),
                new Assign(this.temp.test_lword, new Calc(this.temp.test_lword, "MOD", 2)),
                new UnitTest("LWord mod", this.temp.test_lword, "=", 1),

                new Assign(this.temp.test_usint, new Calc(this.temp.test_usint, "MOD", 2)),
                new UnitTest("USInt mod", this.temp.test_usint, "=", 1),
                new Assign(this.temp.test_sint, new Calc(this.temp.test_sint, "MOD", 2)),
                new UnitTest("SInt mod", this.temp.test_sint, "=", 1),
                new Assign(this.temp.test_uint, new Calc(this.temp.test_uint, "MOD", 2)),
                new UnitTest("UInt mod", this.temp.test_uint, "=", 1),
                new Assign(this.temp.test_int, new Calc(this.temp.test_int, "MOD", 2)),
                new UnitTest("Int mod", this.temp.test_int, "=", 1),
                new Assign(this.temp.test_udint, new Calc(this.temp.test_udint, "MOD", 2)),
                new UnitTest("UDInt mod", this.temp.test_udint, "=", 1),
                new Assign(this.temp.test_dint, new Calc(this.temp.test_dint, "MOD", 2)),
                new UnitTest("DInt mod", this.temp.test_dint, "=", 1),
                new Assign(this.temp.test_ulint, new Calc(this.temp.test_ulint, "MOD", 2)),
                new UnitTest("ULInt mod", this.temp.test_ulint, "=", 1),
                new Assign(this.temp.test_lint, new Calc(this.temp.test_lint, "MOD", 2)),
                new UnitTest("LInt mod", this.temp.test_lint, "=", 1),

                new Assign(this.temp.test_real, new Calc(this.temp.test_real, "MOD", 2)),
                new UnitTest("Real mod", this.temp.test_real, "=", 1.9),
                new Assign(this.temp.test_lreal, new Calc(this.temp.test_lreal, "MOD", 2)),
                new UnitTest("LReal mod", this.temp.test_lreal, "=", 1.9),

                new Assign(this.temp.test_time, new Calc(this.temp.test_time, "MOD", 2)),
                new UnitTest("Time mod", this.temp.test_time, "=", 1),
                new Assign(this.temp.test_ltime, new Calc(this.temp.test_ltime, "MOD", 2)),
                new UnitTest("Time mod", this.temp.test_time, "=", 1),
            ]
        }
    })

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
                "Mod_Fb": fb,
                "Mod_Fb_Instance": fbInstance
            }
    })
}

describe("Simulation primitives", async () => {
    describe("Assign Values MOD= 2", async () => {
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
                    expect(output["file:///Mod_Fb"]).to.toMatchObject([
                        "FUNCTION_BLOCK \"Mod_Fb\"",
                        "{ S7_Optimized_Access := 'TRUE' }",
                        "VERSION : 0.1",
                        "	VAR_TEMP",
                        "		test_byte : Byte := 16#7;",
                        "		test_word : Word := 16#7;",
                        "		test_dword : DWord := 16#7;",
                        "		test_lword : LWord := 16#7;",
                        "		test_lword_bigint : LWord := 16#7;",
                        "		test_sint : SInt := 7;",
                        "		test_usint : USInt := 7;",
                        "		test_int : Int := 7;",
                        "		test_uint : UInt := 7;",
                        "		test_dint : DInt := 7;",
                        "		test_udint : UDInt := 7;",
                        "		test_lint : LInt := 7;",
                        "		test_lint_bigint : LInt := 7;",
                        "		test_ulint : ULInt := 7;",
                        "		test_ulint_bigint : ULInt := 7;",
                        "		test_real : Real := 1.9;",
                        "		test_lreal : LReal := 1.9;",
                        "		test_time : Time := T#5S_7MS;",
                        "		test_ltime : Time := T#5S_7MS;",
                        "	END_VAR",
                        "BEGIN",
                        "	#test_byte := #test_byte MOD 2;",
                        "	#test_word := #test_word MOD 2;",
                        "	#test_dword := #test_dword MOD 2;",
                        "	#test_lword := #test_lword MOD 2;",
                        "	#test_usint := #test_usint MOD 2;",
                        "	#test_sint := #test_sint MOD 2;",
                        "	#test_uint := #test_uint MOD 2;",
                        "	#test_int := #test_int MOD 2;",
                        "	#test_udint := #test_udint MOD 2;",
                        "	#test_dint := #test_dint MOD 2;",
                        "	#test_ulint := #test_ulint MOD 2;",
                        "	#test_lint := #test_lint MOD 2;",
                        "	#test_real := #test_real MOD 2;",
                        "	#test_lreal := #test_lreal MOD 2;",
                        "	#test_time := #test_time MOD 2;",
                        "	#test_ltime := #test_ltime MOD 2;",
                        "",
                        "END_FUNCTION_BLOCK",
                    ])
                })
            })
        })
    })
})
