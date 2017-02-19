import path = require("path");
import { EmitOutput } from "../compiler/emit-output";
import { File } from "../shared/file";

export function create(file: File, source: string, emitOutput: EmitOutput) {

    let result: string = emitOutput.outputText;
    let map: any;
    let datauri: string;

    if (emitOutput.sourceMapText) {

        map = JSON.parse(emitOutput.sourceMapText);
        map.sources[0] = path.basename(file.originalPath);
        map.sourcesContent = [source];
        map.file = path.basename(file.path);
        datauri = "data:application/json;charset=utf-8;base64," + new Buffer(JSON.stringify(map)).toString("base64");

        result = result.replace(
            createComment(file),
            "//# sourceMappingURL=" + datauri
        );
    }

    return result;
}

export function createComment(file: File) {
    return "//# sourceMappingURL=" + path.basename(file.path) + ".map";
}

export function deleteComment(source: string) {
    return source.replace(/\/\/#\s?sourceMappingURL\s?=\s?.*\.map/g, "");
}
