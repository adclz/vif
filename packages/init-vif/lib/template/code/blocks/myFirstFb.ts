import { Fb } from "#pou";
import { UnitLog } from "#unit";

export const MyFirstFb = new Fb({
    body() {
        return [new UnitLog("Hello world!")];
    },
});
