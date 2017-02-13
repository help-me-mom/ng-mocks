import path = require("path");
import EmitOutput = require("./emit-output");
import File = require("./file");

export function create(file: File, source: string, emitOutput: EmitOutput) {

    let result: string = emitOutput.outputText;
    let map: any;
    let datauri: string;

    if (emitOutput.sourceMapText) {

        map = JSON.parse(emitOutput.sourceMapText);
        map.sources[0] = path.basename(file.originalPath);
        map.sourcesContent = [source];
        map.file = path.basename(file.path);
        file.sourceMap = map;
        datauri = "data:application/json;charset=utf-8;base64," + new Buffer(JSON.stringify(map)).toString("base64");

        result = result.replace(
            this.getComment(file),
            "//# sourceMappingURL=" + datauri
        );
    }

    return result;
}

export function getComment(file: File) {
    return "//# sourceMappingURL=" + path.basename(file.path) + ".map";
}
