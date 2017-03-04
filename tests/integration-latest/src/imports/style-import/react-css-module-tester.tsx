import * as React from "react";
import * as ReactCSSModules from "react-css-modules";

// tslint:disable-next-line:no-var-requires
const style = require("./style-import-tester.css");

@ReactCSSModules(style)
export default class ReactCSSModulesTester extends React.Component<any, any> {
    public render() {
        return <div styleName="color">Hello World</div>;
    }
}
