import * as fs from "fs";
import * as http from "http";
import * as util from "util";

export class CoreModuleComponent {

    public testHttp(): any {
        return http.Agent;
    }

    public testUtil(): boolean {
        return util.isNumber(42);
    }
}
