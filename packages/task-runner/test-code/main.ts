import {Fb, InstanceDb, Ob} from "@vifjs/standard/pou"
import {Instance} from "@vifjs/standard/types/complex";
import {Call, Assign} from "@vifjs/standard/operations/basics";
import {Bool} from "@vifjs/standard/types/primitives";
import {BuildSource} from "@vifjs/standard/source";

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
}})
    .exportAsRunnable()