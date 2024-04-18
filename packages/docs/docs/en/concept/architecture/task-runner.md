---
outline: deep
---

# Task Runner

Writing code is nice, however at some point you will need to extend your project with more features.

Indeed, if Vif was only about sending the compiled output in `console.log` it would be really painful to use.

Instead Vif provides a task runner, similar to [grunt](https://gruntjs.com/) or [gulp](https://gulpjs.com/) that allow
you to create your own workflow.

:::info
Make sure you have installed `@vifjs/task-runner` through npm or via the [Install page](/en/install/install)
:::

The runner communicates through chained methods, it also provides a socket and a server for external communication
outside of the process.

## Create your tasks

The recommended way to manage your tasks is to create a `tasks` folder at the root of your project.

Then you can create your tasks individually in separated js files.

### Import the runner

First import the runner.

```ts twoslash
import {StartRunner} from "@vifjs/task-runner/runner"
```

Then create a `Runner` instance that points to the code you wish to use.

```ts twoslash
import {StartRunner} from "@vifjs/task-runner/runner"

const run = await StartRunner("./path/to/your-code.ts")
```

:::info
By default, the first available ports will be chosen, you can force the runner to use arbitrary ports using the options
parameter:

```ts twoslash
import {StartRunner} from "@vifjs/task-runner/runner"

const run = await StartRunner("./path/to/your-code.ts", { socketPort: 3001, serverPort: 3002 })
```

:::

### Add tasks

Next step will be to add tasks to our freshly created runner.

`run` has 2 different chained methods which allow you to register your own callbacks.

Both methods provides `PipeData` and [vif-sim](/en/simulation/introduction) parameters.

#### PipeData

`PipeData` contains various information about the runner current status:

```ts
interface PipeData {
    serverPort?: number, // Current server port
    socketPort?: number, // Current socket port
  
    runnerFile?: string, // File used by the runner (First parameter of StartRunner)
  
    states: OutputStates // States of the runnerFile output
    compilerLocation?: string, // Location of the provider compiler
    providerName?: string, // Name of the provider
    protocol?: string, // Shell protocol of the provider to export your program 
    transformers?: { ty: string; fn: any; }[], // Primitive types transformers of the provider
  
    currentProviderAst?: Record<string, any>, // AST nodes of the provider
    currentProgramAst?: Record<string, any>, // AST nodes of your program
    currentCompiled?: Record<string, any>, // Structured text code of your program
}
```

#### [vif-sim](/en/simulation/introduction)

[vif-sim](/en/simulation/introduction) is the instance of `@vifjs/sim-node` used by the runner to test your code.

```ts
interface [vif-sim](/en/simulation/introduction) {
    getContainer:() => Container // Get access to the container
    getPlugin:() => Plugin // Get access to the plugin
    getAsyncExecutor:() => AsyncExecutor // Get access to the asyncExecutor
}
```

#### once

`once` is called the first time the runner is being executed.

It has a third parameter called `update` that trigger a runner update when it is called.

```ts twoslash
import {StartRunner} from "@vifjs/task-runner/runner"
// ---cut---
const run = await StartRunner("./path/to/your-code.ts")

run.once((data, sim, update) => console.log("Will only log once at beginning!"))
```

##### node-watch

A great usage of `once` is to attach a file watcher to the runner, and updates it when a file change occurs.

```ts twoslash
import {StartRunner} from "@vifjs/task-runner/runner"
// ---cut---
import watch from "node-watch"

const run = await StartRunner("./path/to/your-code.ts")

run.once((data, vif, update) => {
        //@ts-expect-error
        watch("./path/to", { recursive: true }, async () => {
            await update()
        })
    })
```

#### pipe

`pipe` is called everytime the runner has been updated.

```ts twoslash
import {StartRunner} from "@vifjs/task-runner/runner"
// ---cut---
const run = await StartRunner("./path/to/your-code.ts")

run.pipe((data, sim) => console.log("Will only log on every update!"))
```

Both `once` and `pipe` can be chained together

```ts twoslash
import {StartRunner} from "@vifjs/task-runner/runner"
// ---cut---
import watch from "node-watch"

const run = await StartRunner("./path/to/your-code.ts")

run.once((data, vif, update) => {
        //@ts-expect-error
        watch("./path/to", { recursive: true }, async () => {
            await update()
        })
        console.log("Will only log once at beginning!")
    })
    .once(() => console.log("Will also log once"))
    .pipe(() => console.log("Will only log on every update!"))
    .pipe(() => console.log("Will also log on every update!"))
```

## Start the runner

When you have created your runner file, you can just execute it using node:

```shell
node ./tasks/yourTask.js
```

(Assuming you are in the right directory)

A good way to make this process less cumbersome is to add all tasks shell commands in your `package.json` file:

```json
{
  "scripts": {
    "myTask": "node ./tasks/yourTasks.js"
  }
}
```

```shell
npm run myTask
```

Of course, you can create different runner files which correspond to different scenarios:

```
├── tasks
│   └──  firstTask.js
│   └──  secondTask.js
│   └──  ...
│   
```

::: code-group

```shell [firstTask]
npm run firstTask
```

```shell [secondTask]
npm run secondTask
```

:::

## Protocol

`@vifjs/task-runner` comes with a protocol task that calls the protocol registered in the provider.

::: warning
Be careful when you add this to your workflow, because it will trigger the provider protocol on every update.
:::

```ts twoslash
import {StartRunner} from "@vifjs/task-runner/runner"
// ---cut---
import {runProtocol} from "@vifjs/task-runner/protocol"

const run = await StartRunner("./path/to/your-code.ts")

run.once(runProtocol)
```

## Socket

`Runner` has a a websocket whose role is to send the `OutputStates` of `VifData` when it the runner has been
changed.

```ts
const ws = new WebSocket("http://localhost:1234")
ws.onmessage = (ev) => {
    console.log(ev.data)
}
```

## Server

The server accepts the following `GET` requests:

### /__open_in_editor

Opens a file in the IDE (if the runner is launched in an IDE).

Backed by [launch-editor](https://github.com/yyx990803/launch-editor)

### /__get-runner-file

Returns the name of the file used by the runner.

### /__get-protocol

Returns the shell protocol used by the provider.

### /__get-provider

Returns the AST nodes of the provider.

### /__get-program

Returns the AST nodes of your program.

### /__get-compiled

Returns the Structured text code of your program.

### /__get-states

Returns the `OutputStates` of `VifData`, similar to what the websocket sends.
