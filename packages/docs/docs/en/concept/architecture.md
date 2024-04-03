---
outline: deep
---

# Architecture

Now that you've seen the basics, you need to look how the architecture works.

Vif has packages called `provider` which contains all the necessary imports of a specific plc manufacturer.

These packages make sure the code you are writing will be compiled to a specific target.

:::info
When using `init-vif`, the npx binary will ask you which provider you want to use, check
out [Install page](/en/install/install)
:::

Each provider exports a `BuildSource` and `Provider` objects.

## BuildSource

`BuildSource` creates a program source with a folder structure.

### Parameters

#### blocks

To add blocks, add any FB, FC, or OB blocks to the `blocks` field of `BuildSource`.

```ts twoslash
import {Provider, BuildSource} from "#source";
import {Fb} from "#pou";

const MyFb = new Fb({interface: {}})
const MyFb2 = new Fb({interface: {}})

const Source = BuildSource({
    blocks: {
        "MyFb": MyFb,
        "MyFb2": MyFb2
    }
})
```

#### monitor

The `monitor` function tells the simulation to notify plugins when variables have changed.

```ts twoslash
import {Provider, BuildSource} from "#source";
import {Fb} from "#pou";
import {Bool} from "#primitives";

const MyFb = new Fb({interface: {
    static: {
            MyVar: new Bool()    
        }
    }
})

const Source = BuildSource({
    blocks: {
        "MyFb": MyFb,
    },
    monitor() { return [MyFb.static.MyVar] }
})
```

#### signature

`signature` allow you to add a custom signature which will be displayed at the start of each simulation of [vif-sim](/en/simulation/introduction).

```ts twoslash
import {Provider, BuildSource} from "#source";
import {Fb} from "#pou";
import {Bool} from "#primitives";

const MyFb = new Fb({interface: {}})

const Source = BuildSource({
    blocks: {
        "MyFb": MyFb,
    },
    signature: "Hello world"
})
```

### Methods

#### compileProgram

Compiles your program into Structured Text.

#### toAst

Build the AST nodes of your program.

#### exportAsRunnable

Transform the source as a runnable object which can be parsed by the task runner,
see [Task Runner](/en/concept/task-runner).

#### getProvider

Returns the provider instance.

#### getCompiler

Returns the compiler instance.

### Directory structure

`blocks` field accept recursive objects so you can create directories.

```ts twoslash
import {Provider, BuildSource} from "#source";
import {Fb} from "#pou";

// ---cut---
const MyFb = new Fb({interface: {}})
const MyFb2 = new Fb({interface: {}})

const Source = BuildSource({
    blocks: {
        "MyFb": MyFb,
        "MyFolder": {
            "MyFb2": MyFb2
        }
    }
})
```