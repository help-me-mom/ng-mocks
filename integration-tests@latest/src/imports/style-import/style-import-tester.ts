import "./style/css.css";
import "./style/less.less";
import "./style/sass.sass";
import "./style/scss.scss";
import "./style-import-tester.css";
import "../../../assets/style/main.css";

export class StyleImportTester {

    public testRequireCssPackage(): string {

        return require("flexboxgrid").toString();
    }
}
