import * as async from "async";
import * as lodash from "lodash";
import * as os from "os";

import { Configuration } from "../shared/configuration";
import { BundleItem } from "./bundle-item";
import { Resolver } from "./resolve/resolver";

export class Globals {

    constructor(private config: Configuration, private resolver: Resolver) { }

    public add(buffer: BundleItem[], entrypoints: string[], onGlobalsAdded: { (): void }) {

        let items: BundleItem[] = [];

        this.addConstants(items);
        this.addNodeGlobals(items);

        async.eachSeries(items, (item: BundleItem, onGlobalResolved) => {
            async.eachSeries(item.dependencies, (dependency, onModuleResolved) => {
                this.resolver.resolveModule(item.filename, dependency, buffer, () => {
                    onModuleResolved();
                });
            }, () => {
                buffer.unshift(item);
                entrypoints.unshift(item.filename);
                onGlobalResolved();
            });
        }, onGlobalsAdded);
    }

    private addNodeGlobals(items: BundleItem[]): void {

        if (this.config.bundlerOptions.addNodeGlobals) {

            let name = "bundle/node-globals";

            items.push(new BundleItem(name, name,
                os.EOL + "global.process=require('_process');" +
                os.EOL + "global.Buffer=require('buffer').Buffer;",
                undefined, [
                    new BundleItem("_process"),
                    new BundleItem("buffer")
                ])
            );
        }
    }

    private addConstants(items: BundleItem[]): void {

        let source = "";
        let name = "bundle/constants";

        Object.keys(this.config.bundlerOptions.constants).forEach((key) => {
            let value = this.config.bundlerOptions.constants[key];
            if (!lodash.isString(value)) {
                value = JSON.stringify(value);
            }
            source += os.EOL + "global." + key + "=" + value + ";";
        });

        if (source) {
            items.push(new BundleItem(name, name, source, undefined, []));
        }
    }
}
