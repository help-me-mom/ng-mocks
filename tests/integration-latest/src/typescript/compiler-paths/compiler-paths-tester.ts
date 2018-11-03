// @ts-ignore
import { Subject } from "@nodeModules/rxjs";
// @ts-ignore
import * as acorn from "@outsideProject/acorn-walk";

export class CompilerPathsTester {

    public testNodeModules(): string {

        return typeof Subject;
    }

    public testOutsideProject(): string {

        return typeof acorn;
    }
}
