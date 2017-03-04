import * as assert from "assert";
import * as buffer from "buffer";
import * as console from "console";
import * as constants from "constants";
import * as crypto from "crypto";
import * as domain from "domain";
import * as events from "events";
import * as fs from "fs";
import * as http from "http";
import * as os from "os";
import * as util from "util";

export class CoreModuleTester {

    public testAssert(): Function {
        return assert.equal;
    }

    public testBuffer(): Buffer {
        return new buffer.Buffer("string");
    }

    public testConsole(): Function {
        return console.log;
    }

    public testConstants(): number {
        return constants.ENOENT;
    }

    public testCrypto(): string {
        return crypto.createHash("md5").update("string").digest("hex");
    }

    public testDomain(): domain.Domain {
        return domain.create();
    }

    public testEvents(): events.EventEmitter {
        return new events.EventEmitter();
    }

    public testHttp(): any {
        return http.Agent;
    }

    public testOs(): string {
        return os.platform();
    }

    public testUtil(): boolean {
        return util.isNumber(42);
    }
}
