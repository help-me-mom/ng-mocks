class RequiredModule {

    public lookupName?: string;

    constructor(public moduleName: string, public filename?: string,
                public source?: string, public requiredModules?: RequiredModule[]) {}

    public isJson(): boolean {
        return this.filename && /\.json$/.test(this.filename);
    }

    public isNpmModule(): boolean {
        return this.moduleName.charAt(0) !== "." && this.moduleName.charAt(0) !== "/";
    }

    public isScript(): boolean {
        return this.filename && /\.(js|jsx|ts|tsx)$/.test(this.filename);
    }

    public isTypingsFile(): boolean {
        return this.filename && /\.d\.ts$/.test(this.filename);
    }

    public isTypescriptFile(): boolean {
        return this.filename && !this.isTypingsFile() && /\.(ts|tsx)$/.test(this.filename);
    }
}

export = RequiredModule;
