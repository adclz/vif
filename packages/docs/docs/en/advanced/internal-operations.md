# Internal Operations

Internal operations are a list of internal operations only available for providers.

Their purpose is to either reduce the provider code size or access direct memory manipulation.

:::info
In the ast nodes, all internal operations have a `#` in their ty field (even state machines).
:::

## Internal_R_Trig

```ts twoslash
import {Internal_R_Trig} from "@vifjs/language-builder/internal/operations";
```

Do a rising edge.

The constructor has only one parameter which is a boolean reference.

`Internal_R_Trig` extends `Operation<Bool>` so you use it directly in your block operations, 

```ts twoslash
import {Bool} from "#primitives"
import {Internal_R_Trig} from "@vifjs/language-builder/internal/operations";

const AnyBool = new Bool()

const RTrig = new Internal_R_Trig(AnyBool)
```

## Internal_F_Trig

```ts twoslash
import {Internal_F_Trig} from "@vifjs/language-builder/internal/operations";
```

Same behavior as `Internal_R_Trig` except it is a falling edge.

```ts twoslash
import {Bool} from "#primitives"
import {Internal_F_Trig} from "@vifjs/language-builder/internal/operations";

const AnyBool = new Bool()

const RTrig = new Internal_F_Trig(AnyBool)
```

## Internal_Reset

```ts twoslash
import {Internal_Reset} from "@vifjs/language-builder/internal/operations";
```

Force a primitive reference to be reset.

If the user had defined a default value, the primitive will fallback to this default value.

:::warning
Be really careful when using `Internal_Reset` as it is highly permissive and might lead to unexpected behavior.
:::

```ts twoslash
import {Bool} from "#primitives"
import {Fb} from "#pou"
import {Internal_Reset} from "@vifjs/language-builder/internal/operations";

const MyFb = new Fb({
    interface: {
        static: {
            "Test": new Bool(true)
        }
    },
    body() {
        // Will reset back to true (since user defined true as default value).
        // Pointless here, but still a good example
        return [new Internal_Reset(this.static.Test)]
    }
})
```
