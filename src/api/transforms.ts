import * as ESTree from "estree";
import * as log4js from "log4js";
import * as ts from "typescript";

export interface TransformCallback {
    (error: Error, dirty: boolean): void;
};

export interface TransformContextPaths {
    basepath: string;
    filename: string;
    urlroot: string;
}

export interface TransformContextJs{
    ast: ESTree.Program;
}

export interface TransformContextTs{
    version: string;
    ast: ts.SourceFile;
}

export interface TransformContext {
    paths: TransformContextPaths;
    js?: TransformContextJs;
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
