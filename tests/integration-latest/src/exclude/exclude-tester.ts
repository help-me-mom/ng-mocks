export class ExcludeTester {

    public testRequire(): boolean {

        try {
            var x = require("karma-typescript-test-module/excluded");
            
            return false;
        }
        catch (error) {
            return true;
        }
    }
}
