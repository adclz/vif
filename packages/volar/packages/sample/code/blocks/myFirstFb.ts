import {Fb} from "#pou"
import {UnitLog} from "#unit"
import {Assign} from "#basics"
import { Bool } from "#primitives"

export const MyFirstFb = new Fb({
    interface: {
        temp: {
            test: new Bool()
        }
    },
    body() {
        return [
            new UnitLog("Hello world!"),
            new Assign(this.temp.test, 0),
        ]
    }
}) 