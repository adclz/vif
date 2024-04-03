---
outline: deep
---

# Boot Container

[vif-sim](/en/simulation/introduction) provides all the necessary files to be booted seamlessly, you don't have to import the WASM binary manually.

## Boot

To boot the container, import the `Container` class.

```ts twoslash
import {Container} from "@vifjs/sim-node/boot";

const container = new Container()
```

Calling this function will spawn the worker thread where the simulation will run.

If no error is thrown, you then need to call the boot()

```ts twoslash
import {Container} from "@vifjs/sim-node/boot";

const container = new Container()
// ---cut---
container.boot()
```

## Methods

:::info
Some methods that affects the simulation data can't be executed while the simulation is running.

For example you can't load a program if the simulation is already started.

The container will just ignore these commands.
:::

### loadContainerParams

- **Parameter**: `ContainerParams`.

```ts
interface ContainerParams {
    stopOn?: StopOn; // default 0
    stopAfter?: number; // default Infinite
    microTaskFlush?: number;
}

enum StopOn {
    Infinite = 0,
    UnitTestsPassed = 1,
}
```

 - **stopAfter**: Simulation mode:
   - **Infinite**: The simulation will never end until stop / error event.
   - **UnitTestsPassed**: The simulation will end when all unit tests have been reached.
 - **stopOn**: Force the simulation to stop after `n` milliseconds, regardless of `stopOn` parameter.
 - **microTaskFlush**: Runs a `setTimeout(0)` after `n` milliseconds if the simulation is going too fast.
    This is a [trick](https://medium.com/@sohnu/settimeout-with-time-0-what-does-it-really-mean-3b306880a0f6) used internally to schedule certain tasks at the beginning of the next event loop.
    If you have no idea what this is about, leave unchanged.

### loadPlugin

::: tip
It is easier to use the `init` function of a [plugin](/en/simulation/plugins) or [async-executor](/en/simulation/async-executor) instead.
:::

```ts twoslash
import {Container} from "@vifjs/sim-node/boot";

const container = new Container()
// ---cut---
container.loadPlugin("name", 50)
```

### loadProvider

Loads an AST provider in JSON format.

```ts twoslash
import {Container} from "@vifjs/sim-node/boot";

const container = new Container()
// ---cut---
container.loadProvider({})
```

### loadProgram

Loads an AST program in JSON format.

```ts twoslash
import {Container} from "@vifjs/sim-node/boot";

const container = new Container()
// ---cut---
container.loadProgram({})
```

### clearProvider

Clear the provider data.

This is the equivalent of a full reset.

### clearProgram

Clear the user program but keeps the provider data unchanged.

### start

- **Parameter**: `string` the name of the [Ob](/en/language/pou#Ob) that must be used as an entry point.

Start the simulation.

### stop

Stop the simulation.

### pause

Pause the simulation.

### resume

Resume the simulation.

### enableBreakpoint

- **Parameter**: `number` the id of the breakpoint to enable.

:::info
Breakpoints id can be retrieved using the [breakpoints](/en/simulation/plugins#breakpoints) event of any plugin.

However this event is only fired when a program has been parsed.

The [async-executor](/en/simulation/async-executor#getbreakpoints) store all breakpoints automatically.
:::

Enable a breakpoint.

### disableBreakpoint

- **Parameter**: `number` the id of the breakpoint to disable.

Disable a breakpoint.

### enableAllBreakpoints

Enable all breakpoints.

### disableAllBreakpoints

Disable all breakpoints.

Enable all breakpoints.

## Events

The container has several events that you can listen to.

### container:ready

This event is triggered when the container has successfully booted.

It contains an id which is the Uuid of the container.

if the Uuid is undefined, something went wrong while loading the container.

```ts twoslash
import {Container} from "@vifjs/sim-node/boot";

const container = new Container()
// ---cut---
container.on("container:ready", uuid => {
    // ...
})
```

### container:error

When there's an uncaught exception.

```ts twoslash
import {Container} from "@vifjs/sim-node/boot";

const container = new Container()
// ---cut---
container.on("container:error", error => {
    // ...
})
```

### plugin-loaded

Triggered when a plugin has been loaded.

It returns the id of the plugin registered in the following format:

```text
`{plugin_name}__{server_uuid}`
```

```ts twoslash
import {Container} from "@vifjs/sim-node/boot";

const container = new Container()
// ---cut---
container.on("plugin:loaded", id => {
    // ...
})
```