import * as acorn from "acorn";
import * as ESTree from "estree";
import * as ts from "typescript";

export interface TransformCallback {
    (error: Error, dirty: boolean): void;
};

export interface TransformContext {
    ast: ESTree.Program | ts.SourceFile;
    basePath: string;
    filename: string;
    module: string;
    source: string;
    urlRoot: string;
}

export interface Transform {
    (context: TransformContext, callback: TransformCallback): void;
};

export interface KarmaTypescriptConfig {
    bundlerOptions?: BundlerOptions;
    compilerOptions?: CompilerOptions;
    coverageOptions?: CoverageOptions;
    exclude?: string[];
    include?: string[];
    remapOptions?: RemapOptions;
    reports?: Reports;
    transformPath?: Function;
    tsconfig: string;
}

export interface BundlerOptions {
    acornOptions: acorn.Options;
    addNodeGlobals?: boolean;
    entrypoints?: RegExp;
    exclude?: string[];
    ignore?: string[];
    noParse?: string[];
    resolve?: Resolve;
    transforms?: Transform[];
    validateSyntax?: boolean;
}

export interface Resolve {
    alias?: {
        [key: string]: string;
    };
    extensions?: string[];
    directories?: string[];
}

export interface CompilerOptions extends ts.CompilerOptions {
    [key: string]: any;
}

export interface CoverageOptions {
    instrumentation?: boolean;
    exclude?: RegExp | RegExp[];
}

export interface RemapOptions {
    exclude?: RegExp;
    readFile?: { (filepath: string): string };
    sources?: any;
    warn?: Function;
}

export interface Reports {
    clover?: string | Destination;
    cobertura?: string | Destination;
    html?: string | Destination;
    "json-summary"?: string | Destination;
    json?: string | Destination;
    lcovonly?: string | Destination;
    teamcity?: string | Destination;
    "text-lcov"?: string | Destination;
    "text-summary"?: string | Destination;
    text?: string | Destination;
}

export interface Destination {
    directory?: string;
    filename?: string;
    subdirectory?: string;
}
