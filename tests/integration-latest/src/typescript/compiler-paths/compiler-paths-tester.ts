import { Subject } from "@nodeModules/rxjs";
import * as acorn from "@outsideProject/acorn";

export class CompilerPathsTester {

    public testNodeModules(): string {

        return typeof Subject;
    }

    public testOutsideProject(): string {

        return typeof acorn;
    }
}
