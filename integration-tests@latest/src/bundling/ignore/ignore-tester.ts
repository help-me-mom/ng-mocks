import * as io from "socket.io";

export class IgnoreTester {

    public testRequire(): boolean {

        // socket.io requires ws which has dependencies that are incompatible
        return io !== undefined;
    }
}
