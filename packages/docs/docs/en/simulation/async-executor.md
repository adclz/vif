---
outline: deep
---

# Async Executor

Plugins provide an asynchronous executor to control the simulation with promises.

With the async executor, everything is a asynchronous so you can write non-blocking applications.

:::warning
The executor wraps the container and transform methods into Promises, for security reasons only 1 async executor should be used per container.
:::

## Create an async executor

First import `Container` and `Plugin`.

```ts twoslash
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
```

Then boot the container.

```ts twoslash
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
// ---cut---
const container = new Container()
await container.boot()
```

Load the plugin.

```ts twoslash
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
// ---cut---
const container = new Container()
await container.boot()

const plugin = new Plugin("MyPlugin", 100)
```

Use the `getAsyncExecutor`  and `init` methods of plugin to get the executor.

```ts twoslash
import {Container} from "@vifjs/sim-node/boot"
import {Plugin} from "@vifjs/sim-node/plugin"
// ---cut---
const container = new Container()
await container.boot()

const plugin = new Plugin("MyPlugin", 100)

const executor = await plugin.getAsyncExecutor().init(container)
```

## Async Methods

### clearProvider

 - **Returns**: `Promise<void>`

Clear the provider data.

This is the equivalent of a full reset.

### clearProgram

- **Returns**: `Promise<void>`

Clear the user program but keeps the provider data unchanged.

### loadProvider

- **Parameter**: `Record<string, any>` that represents an [AST](/en/advanced/ast) input.
- **Returns**: `Promise<void>`

Load provider data.

### loadProgram

- **Parameter**: `Record<string, any>` that represents an [AST](/en/advanced/ast) input.
- **Returns**: `Promise<void>`

Load user program data.

### startAndWaitUnitTests

- **Parameter**: `string` the name of the [Ob](/en/language/pou#Ob) that must be used as an entry point.
- **Returns**: `Promise<(UnitTest & UnitTestUpdateStatus)[]>`

Start the simulation immediately and returns a [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) that contains all unit tests and their results.

```ts
interface UnitTest {
    description: string;
    id: number;
    status: UnitTestStatus;
}

interface UnitTestUpdateStatus {
    id: number;
    status: UnitTestStatus;
    fail_message: string | null;
}

enum UnitTestStatus {
    Unreached = 0,
    Failed = 1,
    Succeed = 2,
}
```

### getMonitorSchemas

- **Returns**: `MonitorSchema[]`

```ts
interface MonitorSchema {
    path: string[];
    value: {id: number, value: string};
}
```

:::warning
Make sure you have loaded a program first.
:::

Get the monitor schemas of the simulation.

### getMonitorSchemasAsObject

- **Returns**: `Record<string, MonitorSchema["value"]>`

Same as `getMonitorSchemas`, but instead returns a recursive object instead of an Array.

:::warning
Make sure you have loaded a program first.
:::

### start

- **Parameter**: `string` the name of the [Ob](/en/language/pou#Ob) that must be used as an entry point.
- **Returns**: `Promise<void>`

Start the simulation immediately, will resolve / reject when the simulation stops.

### stop

- **Returns**: `Promise<void>`

Stop the simulation.

### pause

- **Returns**: `Promise<void>`

Pause the simulation.

### resume

- **Returns**: `Promise<void>`

Resume the simulation.

### getUnitTests

- **Returns**: `UnitTest[]`

Get the unit tests schemas of the simulation.

```ts
interface UnitTest {
    description: string;
    id: number;
    status: UnitTestStatus;
}
```

:::warning
Make sure you have loaded a program first.
:::

### getBreakpoints

- **Returns**: `BreakPoint[]`

Get the breakpoints registered in the simulation.

```ts
interface BreakPoint {
    path: FileTrace | null;
    id: number;
    status: BreakPointStatus;
}
```

:::warning
Make sure you have loaded a program first.
:::