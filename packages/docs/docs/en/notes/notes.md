# Notes

It takes a lot of time to implements features and debug everything so i'll see how this project is received before continuing any further.

However there are ways this project could be extended.

There are also a few drawbacks.

## Performance

While there's still space for performance improvement of the simulation, there are 2 majors problems which can't be
fixed atm:

### Data serialization

Interaction between the js world and the wasm world has a cost, and when you need to transfer data frequently it creates
a bottleneck where the simulation spends more time converting data than actually simulating the program.
Even if i try to avoid serialization as much as possible and prefer typed arrays, it still slows down the simulation.
The only way this can be fixed is by having a dedicated thread for serialization.
Unfortunately this is impossible for now.

:::info
Usage of web workers would lead to the same problem, since data still needs to be converted between wasm and js.
:::

### Multi threading

At the time i'm writing this, native support for multi-threading in wasm is still a [very experimental thing](https://github.com/WebAssembly/wasi-threads).
There's not much i can do except waiting for a stable implementation.
(Or maybe a nightly build with the preview version).

## Extends

What is really great when you use the language with the biggest ecosystem in the world is that there is a library for
almost anything.

In fact, it would **theorically** be possible to use hardware variables directly since both MQTT brokers & OPC UA have a
nodejs implementation.
Since IO-Link has native support for MQTT, we could communicate directly with a broker without the use of a plc and then
generate the code and global variables.

For node-opcua, a websocket could be implemented as a bridge.

## Contact

You may contact me at this email address: <a href="mailto:me@adclz.net">me@adclz.net</a>.