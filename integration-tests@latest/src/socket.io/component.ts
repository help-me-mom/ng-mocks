import * as io from "socket.io";

export class SocketIoComponent {

    public run(): boolean {

        return io !== undefined;
    }
}
