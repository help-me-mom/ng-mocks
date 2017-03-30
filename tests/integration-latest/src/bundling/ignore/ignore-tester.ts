import * as io from "socket.io";

export class IgnoreTester {

    public testRequireIo(): boolean {

        // socket.io requires ws which has dependencies that are incompatible
        return io !== undefined;
    }

    public testRequireWs(): any {

        return require("ws");
    }
}
