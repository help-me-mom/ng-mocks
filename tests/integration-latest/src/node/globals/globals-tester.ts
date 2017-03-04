export class GlobalsTester {

    public testBuffer(): Buffer {

        return new Buffer("hello");
    }

    public testDirname(): string {

        return __dirname;
    }

    public testFilename(): string {

        return __filename;
    }

    public testGlobal(): NodeJS.Global {

        return global;
    }

    public testProcess(): string {

        return process.cwd();
    }
}
