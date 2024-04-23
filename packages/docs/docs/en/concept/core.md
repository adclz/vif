---
outline: deep
---

<script setup>
import DisplaySnippet from "../../components/snippet/DisplaySnippet.vue";

import {UnitTest} from "#unit";
import {Ob, Fb, InstanceDb} from "#pou";
import {Bool, Int} from "#primitives";
import {Assign, Call} from "#basics";
import {BuildSource} from "#source";

const AssignBoolInvalid = () => {
const MyFb = new Fb({
    interface: {
      static: {
        "AlwaysABool": new Bool()
      }
    },
    body() {
      return [new Assign(this.static.AlwaysABool, 0)]
    }
  });

  const InstanceDbOfFb = new InstanceDb(MyFb);

  return BuildSource({
    blocks: {
      "Main": new Ob({
        body() {
          return [new Call(InstanceDbOfFb, {})]
        }
      }),
      "MyFb": MyFb,
      "InstanceDbOfFb": InstanceDbOfFb
    }
  });
};

const AssignConstantInvalid = () => {
const MyFb = new Fb({
    interface: {
      constant: {
        "AlwaysABool": new Bool()
      }
    },
    body() {
        return [new Assign(this.constant.AlwaysABool, true)]
    }
  });

  const InstanceDbOfFb = new InstanceDb(MyFb);

  return BuildSource({
    blocks: {
      "Main": new Ob({
        body() {
          return [new Call(InstanceDbOfFb, {})]
        }
      }),
      "MyFb": MyFb,
      "InstanceDbOfFb": InstanceDbOfFb
    }
  });
};

const AssertEqSnippet = () => {
const AssertEq = (var1, var2) => new UnitTest("AssertEqual", var1, "=", var2);

const MyFb = new Fb({
  interface: {
      static: {
          MyVar: new Bool(true)
      }
  },
  body() {
      return [AssertEq(this.static.MyVar, true)]
  }
});

  const InstanceDbOfFb = new InstanceDb(MyFb);

  return BuildSource({
    blocks: {
      "Main": new Ob({
        body() {
          return [new Call(InstanceDbOfFb, {})]
        }
      }),
      "MyFb": MyFb,
      "InstanceDbOfFb": InstanceDbOfFb
    }
  });
}
</script>

::: warning There will be bugs.
This project is in an early stage.

It is not associated with any of the companies quoted in this documentation.

It does not come with any warranty, use it at your own risk.
:::

::: tip There will be improvements.
Keep in mind this is the work of only one person.

Some parts could be done differently, some others probably deserve a good refactoring.

I'm open to any suggestions.
:::

::: info Examples
Before we go any further, i will assume you already have a knowledge of how Typescript works.
:::

# What is Vif ?

## In summary

- Vif is a programming language built on top of typescript which
  generates a pseudocode in JSON representing a plc program.

- This code can then be transformed into [Structured text](https://en.wikipedia.org/wiki/Structured_text) code (or anything since anyone can build a compiler)
  for [Programmable Logic Controllers](https://en.wikipedia.org/wiki/Programmable_logic_controller "PLC").

- Vif uses advanced features of typescript type system to make sure your code is safe.

- It works on any IDE as far as this one supports Javascript / Typescript.

- To make sure your code is really, really safe, Vif provides a simulator built with [WASM](https://webassembly.org/)
  that works in both browser & node.

- The simulations are real virtual plcs that work-out-of-box with minimal configuration and no setup required (Yes, the snippets inside this documentation are runtimes and not animations).

You can see Vif as a feature-rich strong-typed plc code generator.

## In practice

To see how Vif works, we'll go directly with a quick example:

Let's say we want to declare a [Function Block](/en/language/pou#fb) with an array of 2 booleans at the static section.

### Array

First we need to declare our array.

```ts twoslash
import {_Array} from "#complex"
import {Bool} from "#primitives";

// ---cut---
const MyArray =  new _Array([new Bool(), new Bool()])
```

Vif knows that your array consist of 2 booleans because you have declared 2 booleans in the constructor.

::: tip
The array is solved as a tuple type, you can check this if you move your cursor over "MyArray".

If you try to access an element at index 3, Typescript will return an error

```ts twoslash
import {_Array} from "#complex"
import {Bool} from "#primitives";

// ---cut---
const MyArray =  new _Array([new Bool(), new Bool()])

const elemtAtPosition0 = MyArray[0]
// @errors: 7053
const elemtAtPosition3 = MyArray[3]
```

:::

::: info 📢
But what if you want to declare more than 2 booleans ? For example 20 ?.
:::

Vif provides a static method called "ArrayFrom" which serves this exact purpose.

```ts twoslash
import {_Array, ArrayFrom} from "#complex"
import {Bool} from "#primitives";

// ---cut---
const MyArray =  ArrayFrom(20, () => new Bool())
```

The first parameter is the length of the array you wish to create.

::: info 📢
Why is there a callback function instead of just declaring the type directly ?
:::

ArrayFrom allows you to control the way each variable of the array should be instanced.

For example, if we want to set the default value of booleans only when index is odd, we could do the following:

```ts twoslash
import {_Array, ArrayFrom} from "#complex"
import {Bool} from "#primitives";

// ---cut---
const MyArray = ArrayFrom(20, (v: Bool, i) => {
  if (i % 2)
      return new Bool(true)
  else return new Bool()
})

// Or
const MyArray2 =  ArrayFrom(20, (v: Bool, i) => i % 2 ? new Bool(true) : new Bool())

// Both variables do the same thing, just the syntax is changing

```

::: tip
Under the hood, this is a wrapper on top of the
native [Array.from](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)
function
:::

### Fb

Now that we have created our array, let's make our [Function Block](/en/language/pou#fb).

```ts twoslash
import {Fb} from "#pou";
import {_Array, ArrayFrom} from "#complex"
import {Bool} from "#primitives";

// ---cut---
const MyFb = new Fb({
  interface: {
        static: {
            "MyArrayOfBools": ArrayFrom(20, (v: Bool, i) => i % 2 ? new Bool(true) : new Bool())
        }
    }
})
```

::: info
So far:

- We make a new [Fb](/en/language/pou#fb).
- We declare the section "static".
- We declare a new variable inside static called "MyArrayOfBools".
- This variable is an array of 20 booleans and all odd indexes have **true** as a default value.
  :::

### Divide and rule

Since we are in javascript, we don't need to redeclare our array multiple times if we plan to reuse it in a block
interface.

We can declare a single variable which will create an array of 20 booleans for us everytime we need it.

```ts twoslash
import {Fb} from "#pou";
import {_Array, ArrayFrom} from "#complex"
import {Bool} from "#primitives";

// ---cut---
const CreateArrayOf20Bools = ArrayFrom(20, (v: Bool, i) => i % 2 ? new Bool(true) : new Bool())

const MyFb = new Fb({
  interface: {
      static: {
          "MyFirstArray": CreateArrayOf20Bools, // [!code ++]
          "MySecondArray": CreateArrayOf20Bools // [!code ++]
      }
  }
})
```

To finish this example, we will add an [If](/en/operations/program-control#If) block to our [Fb](/en/language/pou#fb).

The [If](/en/operations/program-control#If) block will check if the first index of our first array equals the first index of our second array.

Of course this is not a real world use-case, but more a way to complete this example.

```ts twoslash
import {Fb} from "#pou";
import {_Array, ArrayFrom} from "#complex"
import {Bool} from "#primitives";
import {Compare} from "#basics"
import {If} from "#program-control"

// ---cut---
const CreateArrayOf20Bools = ArrayFrom(20, (v: Bool, i) => i % 2 ? new Bool(true) : new Bool())

const MyFb = new Fb({
  interface: {
    static: {
        "MyFirstArray": CreateArrayOf20Bools,
        "MySecondArray": CreateArrayOf20Bools
    }
  },
  body() { // [!code ++]
      return [ // [!code ++]
          new If(new Compare(this.static.MyFirstArray[0], "=", this.static.MySecondArray[0])) // [!code ++]
              .then([ // [!code ++]
                  // do stuff
              ]) // [!code ++]
              .else([ // [!code ++]
                  // do other stuff
              ]) // [!code ++]
      ] // [!code ++]
  } // [!code ++]
})
```

Vif can recognize the interface we declared previously with the "this" keyword.
So we can access each variable in the interface individually.

### Divide more

We can split our operations the same way we did it previously with our interface.

```ts twoslash
import {Fb} from "#pou";
import {_Array, ArrayFrom} from "#complex"
import {Bool} from "#primitives";
import {Compare} from "#basics"
import {If} from "#program-control"

// We use one single function to create an array of bools with odds set to true when we need it
const CreateArrayOf20Bools = ArrayFrom(20, (v: Bool, i) => i % 2 ? new Bool(true) : new Bool())

// The static section can be set outside of our FB
// You could also merge multiple interfaces / sections
const StaticInterfaceWithArrays = {
  static: {
    "MyFirstArray": CreateArrayOf20Bools,
    "MySecondArray": CreateArrayOf20Bools
  }
}

// ---cut---
// This function will always generate a comparison between 2 bools and ... do nothing
// But now we can give it any references from our interface
const AlwaysCompare2Booleans = (compare1: Bool, compare2: Bool) => {
  return new If(new Compare(compare1, "=", compare2))
          .then([
            // do stuff
          ])
          .else([
            // do other stuff
          ])
}

const MyFb = new Fb({
  interface: {
    static: {
        "MyFirstArray": CreateArrayOf20Bools,
        "MySecondArray": CreateArrayOf20Bools
    }},
  body () {
    return [
            AlwaysCompare2Booleans(this.static.MyFirstArray[0], this.static.MySecondArray[0]), // [!code ++]
        ]
    }
})
```

We can also define the static field of our [Fb](/en/language/pou#fb) outside, and use a spread operator to integrate it inside.

```ts twoslash
import {Fb} from "#pou";
import {_Array, ArrayFrom} from "#complex"
import {Bool} from "#primitives";
import {Compare} from "#basics"
import {If} from "#program-control"

// We use one single function to create an array of bools with odds set to true when we need it
const CreateArrayOf20Bools = ArrayFrom(20, (v: Bool, i) => i % 2 ? new Bool(true) : new Bool())

const AlwaysCompare2Booleans = (compare1: Bool, compare2: Bool) => {
  return new If(new Compare(compare1, "=", compare2))
          .then([
            // do stuff
          ])
          .else([
            // do other stuff
          ])
}

// ---cut---
// You could also merge multiple interfaces / sections
const StaticInterfaceWithArrays = {
  static: {
    "MyFirstArray": CreateArrayOf20Bools,
    "MySecondArray": CreateArrayOf20Bools
  }
}

const MyFb = new Fb({
  interface: {
    ...StaticInterfaceWithArrays, // [!code ++]
    },
  body() {
      return [
          AlwaysCompare2Booleans(this.static.MyFirstArray[0], this.static.MySecondArray[0])
      ]
  }
})
```

::: details Click to see full code

```ts twoslash
import {Fb} from "#pou";
import {_Array, ArrayFrom} from "#complex"
import {Bool} from "#primitives";
import {Compare} from "#basics"
import {If} from "#program-control"

// ---cut---
// We use one single function to create an array of bools with odds set to true when we need it
const CreateArrayOf20Bools = ArrayFrom(20, (v: Bool, i) => i % 2 ? new Bool(true) : new Bool())

// The static section can be set outside of our FB
// You could also merge multiple interfaces / sections
const StaticInterfaceWithArrays = {
  static: {
    "MyFirstArray": CreateArrayOf20Bools,
    "MySecondArray": CreateArrayOf20Bools
  }
}

// This function will always generate a comparison between 2 bools and ... do nothing
// But now we can give it any references from our interface
const AlwaysCompare2Booleans = (compare1: Bool, compare2: Bool) => {
  return new If(new Compare(compare1, "=", compare2))
          .then([
            // do stuff
          ])
          .else([
            // do other stuff
          ])
}

const MyFb = new Fb({
    interface: {
        ...StaticInterfaceWithArrays,
    }, body() {
        return [
            AlwaysCompare2Booleans(this.static.MyFirstArray[0], this.static.MySecondArray[0]), 
            // Will do the exact same thing, but this time we will compare the 2 first elements of each aray
            AlwaysCompare2Booleans(this.static.MyFirstArray[1], this.static.MySecondArray[1])
        ]
    }
})
```

:::

::: info
Most of this code could be done with a single for loop, but this is a demonstration of what Vif can do.

You could split operations and interface parts in different files, and then using ESM imports to use it on your main
file.
:::

## Safety

Since we are working with javascript, you might be wondering how vif handles low level types and makes sure operations are valid.

For basics cases, TypeScript type system is enough.

For example, you can't assign a number to a Boolean.

```ts twoslash
// @errors: 2345
import {Ob, Fb, InstanceDb} from "#pou";
import {Bool} from "#primitives";
import {Assign, Call} from "#basics";
import {BuildSource} from "#source";
// ---cut---
const MyFb = new Fb({
  interface: {
    static: {
      "AlwaysABool": new Bool()
    }
  },
  body() {
    return [new Assign(this.static.AlwaysABool, 0)]
  }
})
```

Unfortunately, using TypeScript type system won't be enough for some cases so we need something stronger.

[vif-sim](/en/simulation/introduction) can be used as a parser and will return an hard error if something is wrong.

<ClientOnly>
    <DisplaySnippet :program="AssignBoolInvalid()"/>
</ClientOnly>

:::info
When you are writing code on a hard drive, [vif-sim](/en/simulation/introduction) will also return the stacktrace of where this error came from.
:::

A big limitation are the interface of blocks, because all sections of an interface have the same behavior for Typescript.

So while assigning a constant value might look valid when you're writing code, [vif-sim](/en/simulation/introduction) won't let you go further.

```ts twoslash
import {Ob, Fb, InstanceDb} from "#pou";
import {Bool} from "#primitives";
import {Assign, Call} from "#basics";
import {BuildSource} from "#source";

// ---cut---
const MyFb = new Fb({
  interface: {
    constant: {
      "AlwaysABool": new Bool()
    }
  },
  body() {
    return [new Assign(this.constant.AlwaysABool, true)]
  }
});
```

<ClientOnly>
    <DisplaySnippet :program="AssignConstantInvalid()"/>
</ClientOnly>


## No abstractions

An abstraction can be seen as a function or anything else that generates some Vif code automatically.

_Similar to [MetaProgramming](https://en.wikipedia.org/wiki/Metaprogramming)_

The previous example with Array of bools and odd indexes can be seen as a simple abstraction.

Another example is the creation of an AssertEqual operation using [UnitTest](/en/language/operations/unit#unittest) and [generic](/en/language/types/generics) types.

```ts twoslash
// @errors: 2345
import {Bool, Int} from "#primitives"
import {UnitTest} from "#unit"
import {AnyPrimitiveOrOperation, AnythingThatFits} from "#utilities"

export const AssertEq = <T extends AnyPrimitiveOrOperation, Y extends AnythingThatFits<T>>(var1: T, var2: Y) =>
        new UnitTest("AssertEqual", var1, "=", var2)

// And tada, we have a safe AssertEq

AssertEq(new Bool(true), true)
AssertEq(new Int(50), 50)

// Will fail since you can't compare an int with bool
AssertEq(new Int(50), false)

```
::: details And now you can use AssertEq everywhere.
```ts twoslash
import {Fb} from "#pou"
import {Bool, Int} from "#primitives"
import {UnitTest} from "#unit"
import {AnyPrimitiveOrOperation, AnythingThatFits} from "#utilities"

const AssertEq = <T extends AnyPrimitiveOrOperation, Y extends AnythingThatFits<T>>(var1: T, var2: Y) =>
        new UnitTest("AssertEqual", var1, "=", var2)

const MyFb = new Fb({
  interface: {
      static: {
          MyVar: new Bool(true)
      }
  },
  body() {
      return [AssertEq(this.static.MyVar, true)]
  }
})
```

<ClientOnly>
    <DisplaySnippet :program="AssertEqSnippet()" mode="unit"/>
</ClientOnly>
:::

You might be wondering why AssertEq is not built-in inside vif.

Vif only provide the lowest level code as possible, it is not its job to create abstractions on top of it.

If you create your own functions / library you are free to share it with others or just keep it for yourself.

With this principle, we make sure everyone use the same language and no extra stuff is present without your consent.

Then you can download or create your own code on top of Vif.

With the previous example, you could also do the following:

- Use [OOP](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object-oriented_programming) features to
  extends the existing classes or
  creates [mixins](https://www.typescriptlang.org/docs/handbook/mixins.html), [extension methods](https://www.tutorialspoint.com/how-to-use-extension-methods-in-typescript).
- Or go with a more [functional](https://hackernoon.com/functional-programming-with-javascript-a-deep-dive) approach.
- Use a library to divide / simplify even more.

In fact our previous example could be refactored in many ways because Javascript is the most widespread programming language in the world.

It is even possible to create another language on top of Vif, a graphical one or one with better abstractions.

## Just a node module

Any Vif project is a node module package.

If you think your code / snippet / library is worth sharing it:

- Upload it on [NPM](https://www.npmjs.com/) / any git platform / any [CDN](https://cdnjs.com/).
- Save it locally or use workspace features of  [NPM](https://www.npmjs.com/) / [PNPM](https://pnpm.io/) / [Yarn](https://yarnpkg.com/) / any
  package manager.
- Share / Edit your programs in any online code
  editors ([CodeSandbox](https://codesandbox.io/), [StackBlitz](https://stackblitz.com/)).
- Chain your units tests in any Web unit tests framework.
