import * as fs from "fs";
import * as util from "util";

export class CoreModuleComponent {

    public isNumber(value: number): boolean {

        return util.isNumber(value);
    }
}
