---
outline: deep
---

# Providers

Providers are packages that make sure the code you are writing will be compiled to a specific target.

You must write your code using the `imports` of a specific `provider`.

:::info
When using `init-vif`, the npx binary will ask you which provider you want to use, check
out [Install page](/en/install/install)
:::

Each provider exports a `BuildSource` and `Provider` objects.

## Available providers

Standard provider, mostly used for testing.

<a href="https://www.npmjs.com/package/@vifjs/standard" target="_blank" class="flex flex-row gap-2 w-max">
    <img crossorigin="anonymous" alt="NPM License" src="https://img.shields.io/npm/l/@vifjs/standard">
    <img crossorigin="anonymous" alt="NPM Version" src="https://img.shields.io/npm/v/@vifjs/standard">
</a>

S7-1200.

<a href="https://www.npmjs.com/package/@vifjs/s7-1200" target="_blank" class="flex flex-row gap-2 w-max">
    <img crossorigin="anonymous" alt="NPM License" src="https://img.shields.io/npm/l/@vifjs/s7-1200">
    <img crossorigin="anonymous" alt="NPM Version" src="https://img.shields.io/npm/v/@vifjs/s7-1200">
</a>

S7-1500.

<a href="https://www.npmjs.com/package/@vifjs/s7-1500" target="_blank" class="flex flex-row gap-2 w-max">
    <img crossorigin="anonymous" alt="NPM License" src="https://img.shields.io/npm/l/@vifjs/s7-1500">
    <img crossorigin="anonymous" alt="NPM Version" src="https://img.shields.io/npm/v/@vifjs/s7-1500">
</a>

## BuildSource

`BuildSource` creates a program source with a folder structure.

### Parameters

#### blocks

To add blocks, add any [Fb, Fc, or Ob](/en/language/pou) blocks to the `blocks` field of `BuildSource`.

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
see [Task Runner](/en/concept/architecture/task-runner).

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