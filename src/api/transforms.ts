import * as ESTree from "estree";
import * as log4js from "log4js";
import * as ts from "typescript";

import { Configuration } from "../shared/configuration";

export interface TransformResult {
    dirty?: boolean;
    transpile?: boolean;
    transformedScript?: boolean;
}

export interface TransformCallback {
    (error: Error, dirty: boolean, transpile?: boolean): void;
    (error: Error, result: TransformResult): void;
};

export interface TransformContextJs{
    ast: ESTree.Program;
}

export interface TransformContextTs{
    version: string;
    ast: ts.SourceFile;
    transpiled: string;
}

export interface TransformContext {
    config: Configuration;
    js?: TransformContextJs;
    filename: string;
    module: string;
    source: string;
    ts?: TransformContextTs;
}

export interface TransformInitializeLogOptions {
    appenders: log4js.AppenderConfigBase[];
    level: string;
}

export interface TransformInitialize {
    (log: TransformInitializeLogOptions): void;
}

export interface Transform {
    (context: TransformContext, callback: TransformCallback): void;
    initialize?: TransformInitialize;
};
