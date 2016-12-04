import * as CodeMirror from "codemirror";
import "codemirror/mode/meta";

export class CodemirrorComponent {

    public useMetaModeInfo(): any {

        return (<any>CodeMirror).modeInfo;
    }
}
