import {ExposeArray} from "@/src/types/complex/index.js";
import {
    Int,
    DInt,
    Byte,
    SInt,
    Real,
    LReal,
    DWord,
    String,
    Char,
    WChar,
    WString,
} from "@/src/types/primitives/index.js";
import {Bool} from "@/src/types/primitives/boolean/Bool.js";
import {ExposeFc} from "@/src/pou/index.js";
import {Assign, Call, Compare} from "@/src/operations/basics/index.js";
import {UnitTest} from "@/src/operations/unit/index.js";
import {Cos} from "@/src/operations/math/cos.js";
import {Tan} from "@/src/operations/math/tan.js";
import {ForOf} from "@/src/operations/program-control/index.js";
import {Resolve} from "@/src/template/index.js";
import {Internal_R_Trig} from "@/src/internal/operations/index.js";

const TArray = ExposeArray().Array_
const ArrayFrom = ExposeArray().ArrayFrom
const TFc = ExposeFc()

// Typescript type system test, not meant to be run by vitest.

const MyFcVoid = new TFc({
    interface: {
        input: {
            "Test": new Bool()
        },
        return: new Bool()
    }
})

// Fc Call Interface

// ❌ Should fail since input is missing
new Call(MyFcVoid, {})
                // ^?

// ❌ Should fail since input is missing "Test"
new Call(MyFcVoid, {
    input: {
        // ^?
    }
})

// ❌ Should fail since "Test" is not a bool
new Call(MyFcVoid, {
    input: {
        "Test": new Int()
        // ^?
    }
})

const EmptyFc= new TFc({})

// ❌ Should fail since "anykey" is not "input", "inout", or "output"
new Call(EmptyFc, {
    "anykey": {}
    //^?
})

const EmptyFcWithInput= new TFc({
    interface: {
        input: {
            test: new Bool()
        }
    }
})

// ❌ Should fail since "anykey" is not "input", "inout", or "output"
new Call(EmptyFcWithInput, {
    input: {
      test: true  
    },
    "anykey": {}
    //^?
})

// --  Compare Call with return type DInt

const MyFc = new TFc({
    interface: {
        return: new DInt()
    }
})

const MyFc2 = new TFc({
    interface: {
        return: new Bool()
    }
})

// Infer the return type of Call as DInt
new Compare(new Call(MyFc, {}), "=", new DInt()) 

// ❌ Should fail since a string can't be used
new Compare(new Call(MyFc, {}), "=", "") 
                                  // ^?

// ❌ Same with boolean
new Compare(new Call(MyFc, {}), "=", true) 
                                  // ^?
// But accepts numbers
new Compare(new Call(MyFc, {}), "=", 0)

// Accepts return type as 3rd parameter
new Compare(new Call(MyFc, {}), "=", new Call(MyFc, {})) 

// ❌ Fails if return type is not DInt
new Compare(new Call(MyFc, {}), "=", new Call(MyFc2, {})) 
                                  // ^?

// -- Assign an Int

// Accepts same type
new Assign(new Int(), new Int()) 

// Accepts type with lower size                    
new Assign(new Int(), new SInt()) 

// Accepts type with lower size, even when it's from another family                    
new Assign(new Int(), new Byte()) 

// Accepts any number                    
new Assign(new Int(), 0) 

// ❌ Fails when 2nd parameter is higher "Type cannot be converted safely"
new Assign(new Int(), new DInt()) 
                   // ^?

// ❌ Same, but with a binary
new Assign(new Int(), new DWord()) 
                   // ^?

// ❌ Assign won't accept a js value, since the first parameter has to be a reference
new Assign(0, new DInt()) 
        // ^?
 
// ❌ Same with operations
new Assign(new Call(MyFc, {}), new DInt()) 
        // ^?

// However, return type as 2nd parameter is accepted
new Assign(new DInt(), new Call(MyFc, {})) 

// -- Assign string types

// Accepts same type
new Assign(new Char(), new Char())

// Accepts string
new Assign(new Char(), "")

// ❌ Strict with string types, it has to be the exact same type
new Assign(new Char(), new WChar())
                    // ^?

// ❌ Same but with WString
new Assign(new WString(), new String())
                       // ^?

// -- Math with float

// All single parameter math functions accept js numbers directly
new Cos(0.5)

// Accepts Real
new Cos(new Real())

// ❌ Rejects everything else
new Cos(new Int())
//      ^?

// ❌ Fails when not a number
new Cos("")
//      ^?

// ❌ Same with bool
new Cos(true)
//      ^?

// -- Array

const MyArray1 = new TArray([new Bool()])

// Works
MyArray1[0]

// ❌ Fails since MyArray only contains 1 element (index 0)
MyArray1[1]
//^?

const MyArray2 = ArrayFrom(3, () => new Bool())

// Works
MyArray2[0]
MyArray2[1]
MyArray2[2]

// ❌ Fails
MyArray2[3]
//^?

// -- Bit Access

const MyByte = new Byte()

// Works until 7 (8 bits, same type checking logic as array)
MyByte.getBit(0)
MyByte.getBit(1)
// ...
MyByte.getBit(7)

// ❌ Fails at 8
MyByte.getBit(8)
//            ^?

// --- ForOf

// 1 = FOR
// 2 = OF
// 3 = TO

// All with same type
new ForOf(new Int(), new Int(), new Int())

// Accepts numbers as 2nd and 3rd parameters
new ForOf(new Int(), 1, 6)

// ❌ Fails if FOR is not an integer type
new ForOf(new Bool(), 1, 6)
//        ^?

// ❌ Fails if FOR is not a reference
new ForOf(0, 1, 6)
//        ^?

// ❌ Fails if any other parameters is not a number / PlcInteger
new ForOf(new Int(), "1", 0, 5)
//                   ^?   

// ❌ Same
new ForOf(new Int(), 0, 1, "5")
//                         ^?  

// Unit tests

/// Should be all accepted

new UnitTest("Real tan strictly eq", new Tan(new Real(0.9)), "=", 1.260158)
new UnitTest("Real tan >=", new Tan(new Real(0.9)), ">=", 1.260157)
new UnitTest("Real tan <=",  new Tan(new Real(0.9)), "<=", 1.260159)
new UnitTest("LReal tan >=", new Tan(new LReal(0.9)), ">=", 1.26015821755032)
new UnitTest("LReal tan <=", new Tan(new LReal(0.9)), "<=", 1.26015821755034)

/// --- Resolve
// Resolve must always be solved as any
// So all following lines must have no errors

new Assign(new Resolve([""]), true)
new Assign(new Resolve([""]), 0)
new Assign(new Resolve([""]), new Int())

new Compare(new Resolve([""]), "=", true)
new Compare(new Resolve([""]), "=", 0)
new Compare(new Resolve([""]), "=", new Int())

new Cos(new Resolve([""]))

new Internal_R_Trig(new Resolve([""]))

new Compare(new Internal_R_Trig(new Resolve([""])), "=", true)
