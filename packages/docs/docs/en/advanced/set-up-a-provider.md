---
outline: deep
---

# Set up a provider

:::warning
This section assumes you are already familiar with most concepts of Vif.
:::

## Start

Setting up a provider requires to go deeper in vif mechanics.

<a href="https://www.npmjs.com/package/init-vif-provider" target="_blank" class="flex flex-row gap-2 w-max">
    <img crossorigin="anonymous" alt="NPM License" src="https://img.shields.io/npm/l/init-vif-provider">
    <img crossorigin="anonymous" alt="NPM Version" src="https://img.shields.io/npm/v/init-vif-provider">
</a>

The first thing to do is to use `init-vif-provider`.

```shell
npx init-vif-provider
```

The prompts are very similar to `init-vif`.

```
┌  Generating Vif provider in [outDir]
│
◇  Provider Name:
│  My Provider
│
◇  Options:
│  ○ Ui - Plc simulation in browser (will be added to task main)
│  ○ node-watch - Watch for file changes (will be added to task main)
│  ○ Vitest - Unit test framework
│
```

The following directory structure will be generated:

```
├── src
│   └──  internal
│   └──  source
│   └──  wrap
│   
├── validate.js
│   
├── tests
```

## Using language-builder

`init-vif-provider` will install the `@vifjs/language-builder` package.

This package contains all the necessary data to create a custom provider for Vif.

Check [Factories](/en/advanced/factories) to see how you filter or inject your own attributes with the builder types. 

## Guidelines

### Directory structure

#### internal

Define here the blocks necessary to simulate a plc environment, the most common usage is to declare Counter and Timer Data blocks & Functions.

Next you will need to import the resources and declare them in the `blocks` section of your Provider class.

#### source

source must have an index.ts file which exports both `Provider` and `BuildSource`.

You can also import the `compiler` from `language-builder` and make your own transformers.

index.ts could look like this:

```ts
import {ExposeSource} from "@vifjs/language-builder/source";
import MyCompiler from "@/src/source/compiler";
import MyProvider from "@/src/source/provider";

export const Provider = MyProvider
export const BuildSource = ExposeSource(MyProvider, MyCompiler)
```

#### wrap

Imports all the types you want from `language-builder` and expose them to the end user.

Most types have an `Expose` function which allows you to inject custom attributes.

`Expose` takes care of everything else, such as creating all intersection types.

See [Factories](/en/advanced/factories)

### Provider Class

```ts twoslash
import {Provider} from "@vifjs/language-builder/source";

export default new Provider({
    name: "MyProvider",
    internal: {}
})

```

### Provider Fields

#### name

Name of your provider.

#### agent

URL protocol of the agent associated with this provider.

#### internal

Contains all the blocks you have created in the `internal` folder.

```ts
export default new Provider(
    {
        // ...
        internal: {
            "TP": new TP(),
            "TON": new TON(),
            "TOF": new TOF(),
            "CTU": new CTU(),
            "CTD": new CTD(),
        }
    }
)
```

#### excludeTypes

Ban a type from being used globally.

Normally you could just avoid this field because if you don't want the user to use a specific type, just don't export it in wrap.

But no one is safe from XY problems and you can use this as a 2nd security check.

```ts
export default new Provider(
    {
        internal: {},
        // ...
        // Ban all 64 bits types from being used.
        excludeTypes: ["LTime", "LTod", "LInt", "ULInt"]
    }
)
```

#### filterOperations

Filter operations by types.

This is a `Record<Operation, Record<FirstType, WithOtherTypes[]>>`:
 - **Operation** is a string that represents a built-in rust operation*.
 - **FirstType** is a string for a Primitive Type name.
 - **WithOtherTypes** is an array of string of other type names.

When an operation is not listed in `filterOperations`, [vif-sim](/en/simulation/introduction) will accept all types (as far as the operation is still valid).

Basically:
 - When an operation is present: `deny all operations BUT the ones in the record`.
 - When an operation is not present `accept all operations`.

:::details [*Operations]
For performance reasons, [vif-sim](/en/simulation/introduction) filter operations with their rust built-in names.

You can see the list of all supported operations here:

```ts
type Filtered = Record<string, string[]>

interface FilterOperations {
    assign?: Filtered
    // eq
    eq?: Filtered
    // Compare
    cmp?: Filtered
    abs?: Filtered
    acos?: Filtered
    asin?: Filtered
    atan?: Filtered
    ceil?: Filtered
    cos?: Filtered
    exp?: Filtered
    floor?: Filtered
    ln?: Filtered
    round?: Filtered
    sin?: Filtered
    sqr?: Filtered
    sqrt?: Filtered
    tan?: Filtered
    trunc?: Filtered
    add?: Filtered
    sub?: Filtered
    mul?: Filtered
    div?: Filtered
    mod?: Filtered
    rem?: Filtered
    pow?: Filtered
    rotate_left?: Filtered
    rotate_right?: Filtered
    shl?: Filtered
    shr?: Filtered
    swap?: Filtered
}

```
:::

Since it would be really painful to write rules for every number type, [vif-sim](/en/simulation/introduction) will accept alias that regroup multiple types.

 - **AnyInteger**: Any Unsigned or Signed Integer.
 - **AnyUnsignedInteger**: Any Unsigned Integer.
 - **AnySignedInteger**: Any Signed Integer.
 - **AnyBinary**: Any Binary String.
 - **AnyFloat**: Any Real Number.
 - **AnyString**: Any String or Char type. 
 - **AnyTime**: Any Time type. 
 - **AnyTod**: Any Tod type.

```ts
const anyIntegerOrFloats = {
    "AnyInteger": ["AnyInteger", "AnyBinary", "AnyFloat"],
    "AnyBinary": ["AnyInteger", "AnyBinary", "AnyFloat"],
    "AnyFloat": ["AnyInteger", "AnyBinary", "AnyFloat"],
}

export default new Provider(
    {
        internal: {},
        // ...
        // Here we tell [vif-sim](/en/simulation/introduction) to accept an equality between every integer type, but only Time with Time
        filterOperations: {
            "eq": {
                ...anyIntegerOrFloats,
                "Time": ["Time"],
            }
        }
    }
)
```

#### excludeSections

Exclude types from being present in sections.

excludeSections accepts both built-in type name (ex: Array, Udt, Struct...) or a custom type name you have declared in `internal` (for example TImers, Counters)

```ts
export default new Provider(
    {
        internal: {},
        // ...
        excludeSections: {
            "temp": ["Instance"],
            "constant": ["Instance", "Udt", "Struct", "Array"],
            "return": ["Instance", "Struct", "Array"],
        },
    }
)
```

### overrideReturns

Override the return type of an operation.

This is the same logic as `filterOperations` excepts the syntax is slightly changing.

This is a `Record<Operation, Record<ReturnType, [[TypesCombination]]>>`:
- **Operation** is a string that represents a built-in rust operation*.
- **ReturnType** is a string for a Primitive Type name.
- **TypesCombination** is an array of string tuples which describe the possible combinations.

```ts
export default new Provider(
    {
        internal: {},
        // ...
        // Tells [vif-sim](/en/simulation/introduction) to return a Tod as the result of a subtraction of 2 Time types
        overrideReturns: {
            "sub": {
                "Time": [["Tod", "Tod"]],
            }
        },
    }
)
```

## Validator

Since each provider is different, it is necessary to have the same name for most imports so the end user can quickly switch from one provider to one another.

To make sure you follow the guidelines, a validator script checks if all mandatory features are present and if the consistency of the project is correct.

Validator will also check `tsconfig.json` and `package.json` to see if the project config is the same as all other vif packages, it is necessary to avoid interoperability problems.

::: info
If you've used `init-vif-provider`, validator will be executed automatically when using `npm run build`.
:::

### Mandatory imports

The `package.json` must define your package as a module and the `exports` field has to be like this:

```json
  {
  "imports": {
    "./source": "path/to",
    "./compiler": "path/to",
    "./pou": "path/to",
    "./primitives": "path/to",
    "./complex": "path/to",
    "./utilities": "path/to",
    "./operations/unit": "path/to",
    "./operations/program-control": "path/to",
    "./operations/basics": "path/to",
    "./operations/math": "path/to",
    "./operations/binary": "path/to"
  }
}
```

You are free to choose how operations, types and source related stuff should be located, however it is _heavily_ recommended to have the referred directory structure.