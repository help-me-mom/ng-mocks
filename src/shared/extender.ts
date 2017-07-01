import * as lodash from "lodash";

import PathTool = require("./path-tool");

import {
    Extendable,
    KarmaTypescriptConfig
} from "../api";

export class Extender {

    public static extend(key: string, tsconfig: any, karmaTypescriptConfig: KarmaTypescriptConfig): void {

        let extendable = <Extendable> karmaTypescriptConfig[key];

        if (Array.isArray(extendable)) {
            let list = lodash.union(tsconfig[key], <string[]> extendable);
            tsconfig[key] = this.fixWindowsPaths(list);
        }

        if (lodash.isObject(extendable)) {
            if (extendable.mode === "replace") {
                tsconfig[key] = extendable.values;
            }
            if (extendable.mode === "merge") {
                let list = lodash.union(tsconfig[key], extendable.values);
                tsconfig[key] = this.fixWindowsPaths(list);
            }
            return;
        }
    }

    private static fixWindowsPaths(list: string[]): string[] {
        if (list && list.length) {
            return list.map((item: string) => {
                return PathTool.fixWindowsPath(item);
            });
        }
        return [];
    }
}
