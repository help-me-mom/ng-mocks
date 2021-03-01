import * as convertSourceMap from "convert-source-map";

export class BundleItem {

    public ast?: acorn.Node;
    public lookupName?: string;
    public transformedScript = false;

    constructor(public moduleName: string, public filename?: string,
                public source?: string, public sourceMap?: convertSourceMap.SourceMapConverter,
                public dependencies: BundleItem[] = []) {}

    public isNpmModule(): boolean {
        return this.moduleName.charAt(0) !== "." && this.moduleName.charAt(0) !== "/";
    }

    public isScript(): boolean {
        return (this.filename && !this.isTypingsFile() && /\.(js|jsx|mjs|ts|tsx)$/.test(this.filename))
            || this.transformedScript;
    }

    public isTypingsFile(): boolean {
        return this.filename && /\.d\.ts$/.test(this.filename);
    }

    public isTypescriptFile(): boolean {
        return this.filename && !this.isTypingsFile() && /\.(ts|tsx)$/.test(this.filename);
    }
}
