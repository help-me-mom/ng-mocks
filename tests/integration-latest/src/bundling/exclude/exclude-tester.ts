export class ExcludeTester {

    public testRequire(): boolean {

        try {
            require("indent-string");
            return false;
        }
        catch (error) {
            return true;
        }
    }
}
