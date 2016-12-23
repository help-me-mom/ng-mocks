// readable-stream@2.2.2 has cyclic dependencies with _stream_duplex and _stream_writable requiring each other
require("readable-stream");

export class CyclicDependencyTester {

    public run(): string {

        return "I didn't crash the call stack :)";
    }
}
