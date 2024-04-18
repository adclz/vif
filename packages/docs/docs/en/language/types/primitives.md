---
outline: deep
---

# Primitive types

## Boolean

Classic boolean

Accepts `true` or `false` as default value

```ts twoslash
import {Bool} from "#primitives"

const MyBool = new Bool()
```

## Integers

All Signed and Unsigned integers types.

Accepts any number excepts floats as default value.

Both `ULInt` and `LInt` can also
have [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) as default value.

```ts twoslash
import {
    USInt, SInt,
    UInt, Int,
    UDInt, DInt,
    ULInt, LInt,
} from "#primitives"

const MyUSInt = new USInt(5)
```

You can use the `getBit` method of any integers type to access individual bit of a number.

```ts twoslash
import {
    USInt
} from "#primitives"

const MyUSInt = new USInt(5)

const Bit2 = MyUSInt.getBit(2)
```

`getBit` has the same security as array, which means trying to access an index out of bounds will trigger a typescript
error.

```ts twoslash
// @errors: 2345
import {
    USInt
} from "#primitives"

const MyUSInt = new USInt(5)

const Bit2 = MyUSInt.getBit(9)
```

## Binaries

`LWord` can also
have [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) as default value.

All binary types also have the same `getBit` method of integers.

```ts twoslash
import {
    Byte,
    Word,
    DWord,
    LWord
} from "#primitives"

const MyByte = new Byte(5)
```

:::tip
The default value can be written either in base 2, 10 or 16

```ts twoslash
import {
    Byte,
    Word,
    DWord,
    LWord
} from "#primitives"

const MyWord = new Word(5_555)
const MyWord2 = new Word(0x15B3)
const MyWord3 = new Word(0b0001_0101_1011_0011)
```

:::

## Floats

[IEEE 754](https://en.wikipedia.org/wiki/IEEE_754) float types.

See [Math](/en/language/operations/math) for limitations.

Accepts any float number, will trigger an exception if number is an integer

```ts twoslash
import {
    Real,
    LReal
} from "#primitives"

const MyReal = new Real(56.36)
```

## Strings

Any string type.

Vif do not perform any encoding checking (for now) so there's no difference between a `String` and a `WString`.

Will crash if char is bigger than one char, and if string has more than 256 chars.

```ts twoslash
import {
    String as _String,
    WString,
    Char,
    WChar
} from "#primitives"

const MyChar = new Char('a')
const MyString = new _String('a')
```

## Time

Time types, accepts any integer as default value.

```ts twoslash
import {
    Time,
    LTime,
} from "#primitives"

const MyTime = new Time(5000)
```

Vif provides a `Time_from` and `LTime_from` static methods which can create time values automatically depending on
the time params.

```ts twoslash
import {
    Time_from,
    LTime_from,
} from "#primitives"

const MyTime = Time_from({h: 6, s: 5, ms: 20})
```

## Time of day

Time of day, accepts any integer as default value.

```ts twoslash
import {
    Tod,
    LTod,
} from "#primitives"

const MyTod = new Tod(5000)
```

Vif provides a `Tod_from` and `LTod_from` static methods which can create tod values automatically depending on the
time params.

```ts twoslash
import {
    Tod_from,
    LTod_from,
} from "#primitives"

const MyTod = Tod_from({h: 6, s: 5, ms: 20})
```

## About TypeScript

Since Typescript Type system is [Turing complete](https://github.com/microsoft/TypeScript/issues/14833), Vif tries to
mimic a low level type system as much as possible.

You can see what the type system can do here:

::: details

```ts twoslash
// @errors: 7053 2345
import {Fc} from "#pou";
import {_Array, ArrayFrom} from "#complex";
import {Bool, Int, DInt, Byte, SInt, Real, DWord, String, Char, WChar, WString} from "#primitives";
import {Assign, Call, Compare} from "#basics";
import {Cos} from "#math";
import {ForOf} from "#program-control";

// Typescript type system test, not meant to be run by vitest.

// --  Compare Call with return type DInt

const MyFc = new Fc({
    interface: {
        return: new DInt()
    }
})

const MyFc2 = new Fc({
    interface: {
        return: new Bool()
    }
})

// Infer the return type of Call as DInt
new Compare(new Call(MyFc, {}), "=", new DInt()) 

// ❌ Should fail since a string can't be used
new Compare(new Call(MyFc, {}), "=", "")

// Same with boolean
new Compare(new Call(MyFc, {}), "=", true) 

// But accepts numbers
new Compare(new Call(MyFc, {}), "=", 0)

// Accepts return type as 3rd parameter
new Compare(new Call(MyFc, {}), "=", new Call(MyFc, {})) 

// ❌ Fails if return type is not DInt
new Compare(new Call(MyFc, {}), "=", new Call(MyFc2, {}))

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
                   
// Same, but with a binary
new Assign(new Int(), new DWord())

// ❌ Assign won't accept a js value, since the first parameter has to be a reference
new Assign(0, new DInt())
 
// Same with operations
new Assign(new Call(MyFc, {}), new DInt())

// However, return type as 2nd parameter is accepted
new Assign(new DInt(), new Call(MyFc, {})) 

// -- Assign string types

// Accepts same type
new Assign(new Char(), new Char())

// Accepts string
new Assign(new Char(), "")

// ❌ Strict with string types, it has to be the exact same type
new Assign(new Char(), new WChar())

// ❌ Same but with WString
new Assign(new WString(), new String())

// -- Math with float

// All single parameter math functions accept js numbers directly
new Cos(0.5)

// Accepts Real
new Cos(new Real())

// ❌ Rejects everything else
new Cos(new Int())

// ❌ Fails when not a number
new Cos("")

// Same with bool
new Cos(true)

// -- Array

const MyArray1 = new _Array([new Bool()])

// Works
MyArray1[0]

// Fails since MyArray only contains 1 element (index 0)
MyArray1[1]

const MyArray2 = ArrayFrom(3, () => new Bool())

// Works
MyArray2[0]
MyArray2[1]
MyArray2[2]

// ❌ Fails
MyArray2[3]

// -- Bit Access

const MyByte = new Byte()

// Works until 7 (8 bits, same type checking logic as array)
MyByte.getBit(0)
MyByte.getBit(1)
// ...
MyByte.getBit(7)

// ❌ Fails at 8
MyByte.getBit(8)

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

// ❌ Fails if FOR is not a reference
new ForOf(0, 1, 6)

// ❌ Fails if any other parameters is not a number / PlcInteger
new ForOf(new Int(), "1", 0, 5)

// ❌ Same
new ForOf(new Int(), 0, 1, "5")
```

:::