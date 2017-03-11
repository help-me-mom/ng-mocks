import * as async from "async";
import * as lodash from "lodash";
import * as os from "os";

import { Configuration } from "../shared/configuration";
import { RequiredModule } from "./required-module";
import { Resolver } from "./resolver";

export class Globals {

    constructor(private config: Configuration, private resolver: Resolver) { }

    public add(buffer: RequiredModule[], entrypoints: string[], onGlobalsAdded: { (): void }) {

        let items: RequiredModule[] = [];

        this.addConstants(items);
        this.addNodeGlobals(items);

        async.eachSeries(items, (item: RequiredModule, onGlobalResolved) => {
            async.eachSeries(item.requiredModules, (dependency, onRequiredModuleResolved) => {
                this.resolver.resolveModule(item.filename, dependency, buffer, () => {
                    onRequiredModuleResolved();
                });
            }, () => {
                buffer.unshift(item);
                entrypoints.unshift(item.filename);
                onGlobalResolved();
            });
        }, () => {
            onGlobalsAdded();
        });
    }

    private addNodeGlobals(items: RequiredModule[]): void {

        if (this.config.bundlerOptions.addNodeGlobals) {

            let name = "bundle/node-globals";

            items.push(new RequiredModule(name, name,
                os.EOL + "global.process=require('process/browser');" +
                os.EOL + "global.Buffer=require('buffer/').Buffer;", [
                    new RequiredModule("process/browser"),
                    new RequiredModule("buffer/")
                ])
            );
        }
    }

    private addConstants(items: RequiredModule[]): void {

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
            items.push(new RequiredModule(name, name, source, []));
        }
    }
}
