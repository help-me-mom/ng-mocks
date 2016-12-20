import { SocketIoComponent } from "./component";

describe("SocketIoComponent", () => {

    it("should return not crash the bundler", () => {

        let socketIoComponent = new SocketIoComponent();

        expect(socketIoComponent.run()).not.toBeUndefined();
    });
});
