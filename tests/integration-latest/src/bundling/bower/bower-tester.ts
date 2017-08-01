export class BowerTester {
    public testRequireBowerPackage() {
        let RGBColor = require("rgb-color");
        let color = new RGBColor("darkblue");
        return color.toHex();
    }
}
