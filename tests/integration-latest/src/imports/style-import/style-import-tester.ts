import "../../../assets/style/main.css";
import "./style-import-tester.css";
import "./style/css.css";
import "./style/less.less";
import "./style/sass.sass";
import "./style/scss.scss";

export class StyleImportTester {

    public testRequireCssPackage(): string {

        return require("flexboxgrid").toString();
    }
}
