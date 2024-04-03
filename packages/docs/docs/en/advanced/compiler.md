---
outline: deep
---

# Compiler

The compiler is an event emitter that parses an ast object and outputs a structured text program.

It is the last part of a provider and what will transform all ast nodes into a valid plc code.

Vif has a default compiler which handle most cases, but you can override / extend specific parts to better suit your need.

```ts twoslash
import {Compiler} from "@vifjs/language-builder/source";
```

## Transformers

### Create a compiler

Every time the compiler finds a known schema, it will emit an event and expects a string[] or null return.

To create your own compiler, instantiate a new Compiler

```ts twoslash
import {Compiler} from "@vifjs/language-builder/source";

const MyCompiler = new Compiler()
```

To load the default transformers, call the `useDefaultTransformer()` function.

```ts twoslash
import {Compiler} from "@vifjs/language-builder/source";

const MyCompiler = new Compiler()
// ---cut---
MyCompiler.useDefaultTransformers()
```

### Custom transformers

Every transformer can be overriden with a custom one using the `transform` function.

For example you can change the transformer of an instanceDb

```ts twoslash
import {Compiler} from "@vifjs/language-builder/source";

const MyCompiler = new Compiler()
// ---cut---
MyCompiler.useDefaultTransformers()
MyCompiler.transform("instance_db", (ast, compiler, options) => {
    return []
})
```

Every single transformer callback contains at least the following parameters:

- `ast`: The ast received by the compiler, strong typed
- `compiler`: The compiler instance
- `options`: Specific options sent by the parent type:
    - For example types declared on Db and in an interface of a function are not transformed the same way, Db require
      default values to be declared on the body, while functions must be aligned.

If no transformer is present or if null was returned, the compiler will simply ignore the schema.

### afterTransform

If you do not want to override a transformer but still need to see the output of a specific one, you can use the *
*afterTransform` event.

```ts twoslash
import {Compiler} from "@vifjs/language-builder/source";

const MyCompiler = new Compiler()
// ---cut---
MyCompiler.useDefaultTransformers()
MyCompiler.afterTransform("instance_db", (ast, compiler, options, result) => {
    return []
})
```

The `afterTransform` event has the same callback as `transform` but provides a new field called `result` which
contains the output of the base transformer.

### emit

`emit` explicitly call a specific transformer.

While the compiler can work alone pretty much alone, you need this function to call your own transformers.

::: info
You can use the compiler to format values received by `[vif-sim](/en/simulation/introduction)` if you have enabled default transformers.

```ts twoslash
import {Compiler} from "@vifjs/language-builder/source";

const MyCompiler = new Compiler()
// ---cut---
MyCompiler.useDefaultTransformers()
const formattedTime = MyCompiler.emit("time", { ty: "Time", src: { value: 5000 } }, MyCompiler, {})

// will output "T#5S"
```

:::

### options

Some transformers have specific options telling them how something should be transformed.

Because we won't write the same logic for a specific type multiple times, we just create one transformer for a type and then tell it how it should behave.

For example let's take the default `primitive` transformer:

```ts twoslash
import {Compiler} from "@vifjs/language-builder/source";

const MyCompiler = new Compiler()
// ---cut---
MyCompiler.useDefaultTransformers()
MyCompiler.transform("primitive", (primitive, compiler, options) => {
    // ...
    return []
})
```

If you go hover the `options` field, you will see many optional parameters appear.

#### varName

The variable name.

If not defined, the transformer just won't display it.

#### typesOnly

Used when declaring an interface.

Tells the transformer only the type of the variable should be displayed and eventually its name (if varName defined).

```shell
(Variable?) : Int
```

#### valuesOnly

Same as `typesOnly` excepts it only shows the value. 

It will display varName if defined.

If no value is set (a type declared without default value), null should be returned.

```shell
(Variable?) := 5
```

#### asTypedConstant

Force the type to be displayed as a typed constant.

This is mostly used when calling a function and the parameters can't be inferred from a raw value.

Default transformers with this option enabled won't display the varName, even if defined.

```shell
INT#5
```

:::info
If none of the above is set on transformers which have these options, the transformer will return a combination of both types and values.
```shell
(Variable?) : Int := 5
```
:::

#### inline

Useful when you don't want the transformer to display a comma at the end of its return.

This is mainly used by program-control instructions that often have a syntax similar to a comparison and assign but without a comma.


