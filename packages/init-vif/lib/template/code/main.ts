import {BuildSource} from "#source"
import {Ob} from "#pou"
import {Call} from "#basics"
import {MyFirstFb} from "./blocks/myFirstFb.js";
import {MyFirstInstanceDb} from "./blocks/myFirstInstanceDb.js";

const ObMain = new Ob({
    body() {
        return [new Call(MyFirstInstanceDb({}))]
    }
})

BuildSource({
    blocks: {
        "Main": ObMain,        
        "MyFirstFb": MyFirstFb,
        "MyFirstInstanceDb": MyFirstInstanceDb,
    }
}).exportAsRunnable()