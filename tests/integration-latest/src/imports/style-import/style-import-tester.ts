import "../../../assets/style/main.css";
import "./style/css.css";
import "./style/less.less";
import "./style/sass.sass";
import "./style/scss.scss";

export class StyleImportTester {

    public testRequireTransformedCss(): any {
        return require("./style-import-tester.css");
    }
}
