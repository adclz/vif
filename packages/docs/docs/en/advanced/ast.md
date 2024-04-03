# Arbitrary Syntax Tree

The ast syntax is built with following principles:

- As simple as possible, the tokens should describe exactly what your code is supposed to do.
- Human readable, in a format that everyone knows (JSON).

## Trace

vif-language-builder uses the [stacktrace-js](https://github.com/stacktracejs/stacktrace.js/) package to keep a trace of
where the source and all operations are created.

To be efficient, vif only keeps the path starting from the working directory.
For example the following path:

```text
C:\Users\AnyUsers\WorkingDir\VifProject\Plc\Root.ts
```

Will be simplified to

```text
\Plc\Root.ts
```

Any trace structure have the keys `file`, `line`, `column`.

```json {3-5}
{
  "trace": {
    "file": "\\Plc\\Root.ts",
    "line": 20,
    "column": 5
  }
}
```

::: info
Trace is not a mandatory field, [vif-sim](/en/simulation/introduction) will return it if an error was thrown, but tracing objects do not alter the
simulation behavior.
:::

## Monitor

Only variables which are statically instanced can be monitored.
Each variable is an array of string which describe a path starting from the simulation root.

```json
{
  "monitor": [
    ["MyInstanceDb", "variable"],
    ["MyGlobalDb", "my_array", "[0]"]
  ]
}
```

::: info
If a variable could not be solved, [vif-sim](/en/simulation/introduction) will send a warning.
:::

## Files

Each block is represented with the [file URI scheme](https://en.wikipedia.org/wiki/File_URI_scheme.

```json
{
  "file:///Root": {},
  "file:///Folder//AFbBlock": {},
  "file:///AnotherFolder//NestedFolder//AFcBlock": {}
}
```

### Program blocks

All program blocks have a `ty` and a `src` keys.

```json {3-4}
{
  "file:///Root": {
    "ty": "fb", //Or ib, fc, global_db, instance_db
    "src": {
      "interface": {
        // All the sections and variables associated
      },
      "body": [
        // All operations
        // This key is only availble in ib, fb, and fc blocks
      ]
    }
  }
}
```

### Udt

Udts also have a `ty` and a `src` key.

```json {3-4}
{
  "file:///IEC_TIMER": {
    "ty": "udt",
    "src": {
      "name": "IEC_TIMER",
      "interface": {
        // No sections
        // All variables are created directly
      },
    }
  }
}
```

### Trace

