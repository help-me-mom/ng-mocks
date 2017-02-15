import BundleCallback = require("./bundle-callback");

class RequiredModule {

    public callback?: BundleCallback;
    public isTypescriptFile?: boolean;
    public isTypingsFile?: boolean;
    public lookupName?: string;

    constructor(public moduleName: string, public filename?: string,
                public source?: string, public requiredModules?: RequiredModule[]) {
        this.isTypingsFile = filename && /\.d\.ts$/.test(filename);
        this.isTypescriptFile = filename && !this.isTypingsFile && /\.(ts|tsx)$/.test(filename);
    }
}

export = RequiredModule;
