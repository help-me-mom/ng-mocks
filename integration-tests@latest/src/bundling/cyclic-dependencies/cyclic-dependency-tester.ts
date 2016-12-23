export class CyclicDependencyTester {

    public testRequireCyclicDependency(): any {

        // readable-stream@2.2.2 has cyclic dependencies with _stream_duplex and _stream_writable requiring each other
        return require("readable-stream");
    }
}
