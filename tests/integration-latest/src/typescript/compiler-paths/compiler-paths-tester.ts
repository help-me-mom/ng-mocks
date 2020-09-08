import add from "karma-typescript-test-module-add";
import add2 from "@karma-typescript-test-module/add/index";

export class CompilerPathsTester {

    public testNodeModules1(): number {

        return add(1, 2);
    }

    public testNodeModules2(): number {

        return add2(1, 2);
    }
}
