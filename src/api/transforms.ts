import * as ESTree from "estree";
import * as log4js from "log4js";
import * as ts from "typescript";

import { EmitOutput } from "../compiler/emit-output";
import { Configuration } from "../shared/configuration";

export interface TransformCallback {
    (error: Error, dirty: boolean): void;
};

export interface TransformContextJs{
    ast: ESTree.Program;
}

export interface TransformContextTs{
    version: string;
    ast: ts.SourceFile;
}

export interface TransformContext {
    config: Configuration;
    js?: TransformContextJs;
    filename: string;
    module: string;
    source: string;
    emitOutput?: EmitOutput;
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
