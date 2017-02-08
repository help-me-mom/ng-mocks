import * as CodeMirror from "codemirror";
import "codemirror/mode/meta";

export class CodemirrorTester {

    public testMetaModeInfo(): any {

        return (<any>CodeMirror).modeInfo;
    }
}
