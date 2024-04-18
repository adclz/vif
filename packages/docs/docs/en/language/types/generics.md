# Generics

At some point you will probably want to create your own abstractions on top of Vif components.

However you will need to rewrite most generic constraints because TypeScript can't infer the return type of a function.

To fix this issue, VIf has the `#utilities` import which contains type definitions for all cases an operation can have.

```ts twoslash
import {
    AnyPrimitiveOrOperation,
    AnyPrimitive,
    AnyNumberPrimitive,
    AnyIntegerPrimitive,
    AnythingThatFits,
    OffsetLessOrEqual
} from "#utilities"

```

## AnyPrimitiveOrOperation

Any Plc primitive or Operation that returns a Plc primitive.

This type does not accept raw js values such as `string | number | boolean`.

Instead, the user will have to add a reference to an existing type or create a new Plc primitive.

```ts twoslash
import {Bool} from "#primitives"
import {Fc} from "#pou"
import {Call} from "#basics"
import {AnyPrimitiveOrOperation} from "#utilities"

const MyGreatFn = <T extends AnyPrimitiveOrOperation>(arg1: T) => arg1

const MyGreatFnCallBool = MyGreatFn(new Bool())
// MyGreatFnCall is now of type MyGreatFnCall<Bool<Std>>


// Will infer the returns type of any Fc return when using call
const AnFcThatReturnsABool = new Fc({
    interface: {
        return: new Bool()
    }
})

const MyGreatFnCallFc = MyGreatFn(new Call(AnFcThatReturnsABool, {}))
```

## AnyPrimitive

Same as **AnyPrimitiveOrOperation** excepts it won't accept an operation.

This is useful for assignments where the first parameter has to be a reference.

:::warning
If you need to have a reference and don't wan't the user to create a type directly, it is unfortunately impossible for TypeScript to know if the type is a reference or not.

However [vif-sim](/en/simulation/introduction) will detect if a reference was expected and returns an error.
:::

## AnyNumberPrimitive

Same as `AnyPrimitive` but only accept Number types (Integers, Floats, Time, TOD).

## AnyIntegerPrimitive

Same as `AnyNumberPrimitive` but rejects Floats.

## AnythingThatFits

Could be translated by _Accepts anything that matches the generic parameter T_.

Where T is often the first generic of the function you're building.

`AnythingThatFits` will allow:
 - References or new Plc Primitives.
 - Raw Js values `string | number | boolean`.
 - Operations.

All are accepted as far as they match the type of T

Same example as the core page.

```ts twoslash
// @errors: 2345
import {Bool, Int} from "#primitives"
import {UnitTest} from "#unit"
import {AnyPrimitiveOrOperation, AnythingThatFits} from "#utilities"

export const AssertEq = <
    T extends AnyPrimitiveOrOperation, 
    Y extends AnythingThatFits<T>>(var1: T, var2: Y) =>
    new UnitTest("AssertEqual", var1, "=", var2)

// And tada, we have a safe AssertEq

AssertEq(new Bool(true), true)
AssertEq(new Int(50), 50)

// Will fail since you can't compare an int with bool
AssertEq(new Int(50), false)

```

## OffsetLessOrEqual

Checks if the size of any number type `Y` is not greater than any number type `T`.

This is useful for `Assign` operations to check if we're not doing an assignment that could lead to a data loss.

```ts twoslash
// @errors: 2345
import {SInt, Int} from "#primitives"
import {AnyPrimitiveOrOperation, AnythingThatFits, OffsetLessOrEqual} from "#utilities"

// A function that returns nothing but only accepts var2 if the size is <= than var1.
const MyFunction = <T extends AnyPrimitiveOrOperation, 
    Y extends AnythingThatFits<T>>(var1: T, var2: OffsetLessOrEqual<T, Y>) => {}

// Works fine.
MyFunction(new SInt(), new SInt())
    
// Will fail since SInt is 255 max but Int could be bigger.
MyFunction(new SInt(), new Int())

// However the reverse is allowed.
MyFunction(new Int(), new SInt())
```