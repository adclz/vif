---
outline: deep
---

<script setup>
import Container from "../../../components/Container.vue";
import DisplaySnippet from "../../../components/snippet/DisplaySnippet.vue";

import {UnitTest, UnitLog} from "#unit";
import {Ob, Fb, InstanceDb} from "#pou";
import {Real, LReal} from "#primitives";
import {Assign, Call} from "#basics";
import {Tan} from "#math";
import {BuildSource} from "#source";

const TanCalculation = () => {
// For reasons, esbuild breaks real types when types are inlined

const fb = new Fb({
    interface: {
        static: {
            MyReal: new Real(0.9),
            MyLReal: new LReal(0.9)
        }
    },
    body() {
        return [
            new UnitTest("Real tan strictly eq", new Tan(this.static.MyReal), "=", 1.260158),

            new UnitTest("Real tan >=", new Tan(this.static.MyReal), ">=", 1.260157),
            new UnitTest("Real tan <=",  new Tan(this.static.MyReal), "<=", 1.260159),
                
            new UnitTest("LReal tan >=", new Tan(this.static.MyLReal), ">=", 1.26015821755032),
            new UnitTest("LReal tan <=", new Tan(this.static.MyLReal), "<=", 1.26015821755034),
        ]
    }
});

    const fbInstance = new InstanceDb(fb);

    return BuildSource({
        blocks:
            {
                "Main": new Ob(
                    {
                        body() {
                            return [new Call(fbInstance, {})]
                        }
                    }
                ),
                "Tan_Fb": fb,
                "Tan_Fb_Instance": fbInstance
            }
    });
}

const ValidEqFloat = () => {
const fb = new Fb({
    interface: {
        static: {
            MyReal: new Real(0.9256),
            MyLReal: new LReal(0.9256987)
        }
    },
    body() {
        return [
            new UnitTest("Real strictly eq", this.static.MyReal, "=", 0.9256),
            new UnitTest("LReal strictly eq", this.static.MyLReal, "=", 0.9256987),
        ]
    }
})

    const fbInstance = new InstanceDb(fb);

    return BuildSource({
        blocks:
            {
                "Main": new Ob(
                    {
                        body() {
                            return [new Call(fbInstance, {})]
                        }
                    }
                ),
                "Tan_Fb": fb,
                "Tan_Fb_Instance": fbInstance
            }
    });
}
</script>
# Math

Most mathematical operations are supported by vif.

Calculations on float numbers might not work the same way as a real plc.

[vif-sim](/en/simulation/introduction) uses the [IEEE 754 float types](https://en.wikipedia.org/wiki/IEEE_754) similar to [IEC standard](https://en.wikipedia.org/wiki/IEC_61131-3).

It is a [tough subject](https://floating-point-gui.de/) in computer science, to avoid sacrificing too much performance
[vif-sim](/en/simulation/introduction) does not use any arbitrary-precision library except the
built-in [rust formatter](https://doc.rust-lang.org/std/primitive.f32.html).

_Just Remember the digits representation of a float number is not the real number in memory._

For example, it's often impossible to guarantee equality between 2 float types if both numbers have too many digits, unless we use Lt / Gt operators:

```ts twoslash
import {UnitTest, UnitLog} from "#unit";
import {Ob, Fb, InstanceDb} from "#pou";
import {Real, LReal} from "#primitives";
import {Assign, Call} from "#basics";
import {Tan} from "#math";

// ---cut---
const fb = new Fb({
    interface: {
        static: {
            MyReal: new Real(0.9),
            MyLReal: new LReal(0.9)
        }
    },
    body() {
        return [
            // Will fail
            new UnitTest("Real tan strictly eq", new Tan(this.static.MyReal), "=", 1.260158),

            new UnitTest("Real tan >=", new Tan(this.static.MyReal), ">=", 1.260157),
            new UnitTest("Real tan <=",  new Tan(this.static.MyReal), "<=", 1.260159),

            new UnitTest("LReal tan >=", new Tan(this.static.MyLReal), ">=", 1.26015821755032),
            new UnitTest("LReal tan <=", new Tan(this.static.MyLReal), "<=", 1.26015821755034)
        ]
    }
})
```

<ClientOnly>
    <DisplaySnippet :program="TanCalculation()" mode="unit"/>
</ClientOnly>

However, if the number is rational, Equality will works fine.

```ts twoslash
import {UnitTest, UnitLog} from "#unit";
import {Ob, Fb, InstanceDb} from "#pou";
import {Real, LReal} from "#primitives";
import {Assign, Call} from "#basics";
import {Tan} from "#math";

// ---cut---
const fb = new Fb({
    interface: {
        static: {
            MyReal: new Real(0.9256),
            MyLReal: new LReal(0.9256987)
        }
    },
    body() {
        return [
            new UnitTest("Real strictly eq", this.static.MyReal, "=", 0.9256),
            new UnitTest("LReal strictly eq", this.static.MyLReal, "=", 0.9256987),
        ]
    }
})
```

<ClientOnly>
    <DisplaySnippet :program="ValidEqFloat()" mode="unit"/>
</ClientOnly>

## Abs

Returns the absolute value of a number.

```ts twoslash
import {Abs} from "#math"

const MyAbs = new Abs(50)
```

## Acos

Returns the ArcCos of any REAL.

```ts twoslash
import {ACos} from "#math"

const MyACos = new ACos(0.5)
```

## ASin

Returns the ArcSin of any REAL.

```ts twoslash
import {ASin} from "#math"

const MyASin = new ASin(0.5)
```

## ATan

Returns the ArcTan of any REAL.

```ts twoslash
import {ATan} from "#math"

const MyATan = new ATan(0.5)
```

## Ceil

Rounds a REAL to the higher nearest integer.

```ts twoslash
import {Ceil} from "#math"

const MyCeil = new Ceil(0.2)
```

## Cos

Returns the Cos of any REAL.

```ts twoslash
import {Cos} from "#math"

const MyCos = new Cos(0.5)
```

## Exp

Returns the exponential of any REAL.

```ts twoslash
import {Cos} from "#math"

const MyCos = new Cos(0.5)
```

## Floor

Rounds any REAL to the lowest nearest integer.

```ts twoslash
import {Floor} from "#math"

const MyFloor = new Floor(0.5)
```

## Fract

Returns the fractional part of any REAL.

```ts twoslash
import {Floor} from "#math"

const MyFloor = new Floor(0.5)
```

## Ln

Returns the natural logarithm part of any REAL.

```ts twoslash
import {Ln} from "#math"

const MyLn = new Ln(0.5)
```

## Round

Rounds any REAL to the nearest integer.

```ts twoslash
import {Round} from "#math"

const MyRound = new Round(0.6)
```

## Sin

Returns the Sin of any REAL.

```ts twoslash
import {Sin} from "#math"

const MySin = new Sin(0.5)
```

## Sqr

Returns the square of any number (basically x*x).

```ts twoslash
import {Sin} from "#math"

const MySin = new Sin(0.5)
```

## Sqrt

Returns the square root of any number.

```ts twoslash
import {Sin} from "#math"

const MySin = new Sin(0.5)
```

## Tan

Returns the Tan of any REAL.

```ts twoslash
import {Tan} from "#math"

const MyTan = new Tan(0.5)
```

## Trunc

Returns the integer part of any REAL.

```ts twoslash
import {Trunc} from "#math"

const MyTrunc = new Trunc(0.5)
```
