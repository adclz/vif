import {Fb, InstanceDb, Ob} from "@vifjs/s7-1200/pou"
import {Instance} from "@vifjs/s7-1200/types/complex";
import {Call, Assign} from "@vifjs/s7-1200/operations/basics";
import {Bool} from "@vifjs/s7-1200/types/primitives";
import {BuildSource} from "@vifjs/s7-1200/source";

export const MyFb = new Fb({
    interface: {
        input: {
            test: new Bool(),
        }
    },
     body() {
        return [ 
            new Assign(this.input.test, true)
        ] 
    }   
})

const InstanceDBFB = new InstanceDb(MyFb, {})

export const Entry = new Ob({
    interface: {},
    body () {
    return [
        new Call(InstanceDBFB, {
            input: {
                test: new Bool(true)
            } 
        })
    ]}
})   
 
BuildSource({
    blocks: {
        "MyFb": MyFb,
        "Entry": Entry, 
        "MyBlocGb": InstanceDBFB
}, monitor() {
    return [this.MyBlocGb.input.test]
},})
    .exportAsRunnable()