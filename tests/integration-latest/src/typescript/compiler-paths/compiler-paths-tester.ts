import { Subject } from "@nodeModules/rxjs";
// Ignore implicit any error on the module without type definitions.
// @ts-ignore
import * as acorn from "@outsideProject/acorn";

export class CompilerPathsTester {

    public testNodeModules(): string {

        return typeof Subject;
    }

    public testOutsideProject(): string {

        return typeof acorn;
    }
}
