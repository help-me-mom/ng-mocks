import * as lodash from "lodash";

import PathTool = require("./path-tool");

import {
    Extendable,
    KarmaTypescriptConfig
} from "../api";

export class Extender {

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static extend(key: string, tsconfig: any, karmaTypescriptConfig: KarmaTypescriptConfig): void {

        const extendable = karmaTypescriptConfig[key] as Extendable;

        if (Array.isArray(extendable)) {
            const list = lodash.union(tsconfig[key], extendable as string[]);
            tsconfig[key] = this.fixWindowsPaths(list);
        }

        if (lodash.isObject(extendable)) {
            if (extendable.mode === "replace") {
                tsconfig[key] = extendable.values;
            }
            if (extendable.mode === "merge") {
                const list = lodash.union(tsconfig[key], extendable.values);
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
