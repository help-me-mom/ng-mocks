import * as fs from "fs";
import * as util from "util";
import * as http from "http";

export class CoreModuleComponent {

    public testHttp(): any {
        return http.Agent;
    }

    public testUtil(): boolean {
        return util.isNumber(42);
    }
}
