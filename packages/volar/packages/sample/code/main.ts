import {BuildSource} from "#source"
import {Ob} from "#pou"
import {Assign, Call} from "#basics"
import {MyFirstFb} from "./blocks/myFirstFb.js";
import {MyFirstInstanceDb} from "./blocks/myFirstInstanceDb.js";
import {Bool} from "@vifjs/standard/types/primitives";

const ObMain = new Ob({
    interface: {
        temp: {
            test: new Bool()
        }
    },
    body() {
        return [
            new Assign(this.temp.test, true),
            new Call(MyFirstInstanceDb, {})
        ]
    }
})

BuildSource({
    blocks: {
        "Main": ObMain,        
        "MyFirstFb": MyFirstFb,
        "MyFirstInstanceDb": MyFirstInstanceDb,
    }
}).exportAsRunnable()