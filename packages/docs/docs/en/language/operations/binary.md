---
outline: deep
---

# Binary

All operations with binary strings.

## RotateLeft

Rotate left a binary type `n` times specified with the 2nd parameter.

```ts twoslash
import {Byte} from "#primitives"
import {RotateLeft} from "#binary"

const Rol = new RotateLeft(new Byte(0b1111), new Byte(0b0001))
```

## RotateRight

Rotate right a binary type `n` times specified with the 2nd parameter.

```ts twoslash
import {Byte} from "#primitives"
import {RotateRight} from "#binary"

const Ror = new RotateRight(new Byte(0b1111), new Byte(0b0001))
```

## Shl

Shift left a binary type `n` times specified with the 2nd parameter.

```ts twoslash
import {Byte} from "#primitives"
import {Shl} from "#binary"

const MyShl = new Shl(new Byte(0b1111), new Byte(0b0001))
```

## Shr

Shift right a binary type `n` times specified with the 2nd parameter.

```ts twoslash
import {Byte} from "#primitives"
import {Shr} from "#binary"

const MyShr = new Shr(new Byte(0b1111), new Byte(0b0001))
```

## Swap

Swap the bytes of a binary type.

```ts twoslash
import {Byte} from "#primitives"
import {Swap} from "#binary"

const MySwap = new Swap(new Byte(0b1111))
```