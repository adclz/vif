---
outline: deep
---

# CreateSource

The CreateSource function is a very important part of any vif project, this is what allow your program to compile to
both ast and structured text.

The provider pack you have chosen must give you an import which allow you to use it.

```ts twoslash


```

CreateSource performs some black magic to solve every references of your program and build a valid ast / st.

At first you might struggle using it because one of the most common error is when you refer to a global variable you
created, but you did not create a field in the source object.

This example will fail to compile because vif can't find "MyFb".

```ts
import MyFb from "./MyFb.js"

const MySecondFb = new Fb({},
    function () {
        return [
            new Assign(MyFb.MyVariable, 0)
        ]
    }
)

const CreateSource = CreateSource({
    "MySecondFb": MySecondFb,
}, {})
```

To solve this problem, you need to explicitly add every global references you want to use in your program

```ts
import MyFb from "./MyFb.js"

const MySecondFb = new Fb({},
    function () {
        return [
            new Assign(MyFb.MyVariable, 0)
        ]
    }
)

const CreateSource = CreateSource({
    "MyFb": MyFb, // [!code ++]
    "MySecondFb": MySecondFb,
}, {})
```

## Fields

Each field is optional, you don't need to declare everything.

### Blocks

```ts twoslash

```

All Pou blocks - except Udt - have to be declared on the first parameter of source.

```ts
const CreateSource = CreateSource({
    "MyFirstBlock": VariableWithFb,
    "AnotherBlock": AnotherVariableWithFb
})
```

CreateSource supports recursive types and will interpret parent keys as folders.

```ts
const CreateSource = CreateSource({
    "Folder": {
        "MyFirstBlock": VariableWithFb, /// Will be interpreted as file:///Folder/MyFirstBlock // [!code highlight]
    },
    "AnotherBlock": VariableWithFb
}, {})
```

### Udt

The second parameter allows you to declare your global data types

```ts
const CreateSource = CreateSource({
    "MyFirstBlock": VariableWithFb,
    "AnotherBlock": AnotherVariableWithFb
}, {
    "AFirstUdt": AnUdt // [!code ++]
})
```

### Monitor

Finally, specify the variables you want to monitor.

::: warning
You can only monitor variables declared in DataBlocks.
If the simulator fails to find a variable, it will return a warning
:::

```ts
const CreateSource = CreateSource({
        "MyFirstBlock": VariableWithFb,
        "AnotherBlock": AnotherVariableWithFb
    }, {
        "AFirstUdt": AnUdt
    },
    function () { // [!code ++]
        return this.MyFirstBlock.AnyVariable // [!code ++]
    }) // [!code ++]
```

## Methods

### toAst()

Compiles the source to ast.

The ast can only be used the simulator, to know more about the ast syntax, [click here](/en/advanced/ast).

### toSt()

Compiles the source to a the structured text version.