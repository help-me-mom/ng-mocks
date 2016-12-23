
export class NoModuleExportsTester {

    public testNoModuleExports(): any {

        // text-export@0.6.1 requires "./encoding-indexes.js" which has no module.exports
        return require("text-encoding");
    }
}
