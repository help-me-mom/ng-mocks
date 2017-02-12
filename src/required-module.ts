class RequiredModule {

    public isTypescriptFile: boolean;
    public isTypingsFile: boolean;

    constructor(public filename: string, public moduleName: string) {
        this.isTypingsFile = filename && /\.d\.ts$/.test(filename);
        this.isTypescriptFile = filename && !this.isTypingsFile && /\.(ts|tsx)$/.test(filename);
    }
}

export = RequiredModule;
