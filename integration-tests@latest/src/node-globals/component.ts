export class NodeGlobalComponent {

    public getBuffer(): Buffer {

        return new Buffer("hello");
    }

    public getCurrentDirectory(): string {

        return process.cwd();
    }

    public getDirname(): string {

        return __dirname;
    }

    public getFilename(): string {

        return __filename;
    }

    public getGlobal(): NodeJS.Global {

        return global;
    }
}
