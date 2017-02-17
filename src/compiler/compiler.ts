import * as async from "async";
import * as lodash from "lodash";
import { Logger } from "log4js";
import * as ts from "typescript";

import Benchmark = require("../shared/benchmark");
import CompileCallback = require("./compile-callback");
import Configuration = require("../shared/configuration");
import File = require("../shared/file");

type CompiledFiles = { [key: string]: string; };

type Queued = {
    file: File;
    callback: CompileCallback;
};

class Compiler {

    private readonly COMPILE_DELAY = 200;

    private cachedProgram: ts.Program;
    private compiledFiles: CompiledFiles = {};
    private compilerHost: ts.CompilerHost;
    private emitQueue: Queued[] = [];
    private hostGetSourceFile: {(filename: string, languageVersion: ts.ScriptTarget,
                                 onError?: (message: string) => void): ts.SourceFile};
    private log: Logger;
    private program: ts.Program;
    private tsconfig: ts.ParsedCommandLine;

    private deferredCompile = lodash.debounce(() => {
        this.compileProgram(this.onProgramCompiled);
    }, this.COMPILE_DELAY);

    constructor(private config: Configuration) { }

    public initialize(logger: any, tsconfig: ts.ParsedCommandLine): void {
        this.tsconfig = tsconfig;
        this.log = logger.create("compiler.karma-typescript");
        this.log.info("Compiling project using Typescript %s", ts.version);
        this.outputDiagnostics(tsconfig.errors);
    }

    public compile(file: File, callback: CompileCallback): void {

        this.emitQueue.push({
            file,
            callback
        });

        this.deferredCompile();
    }

    private onProgramCompiled = (): void => {

        this.emitQueue.forEach((queued) => {

            let sourceFile = this.program.getSourceFile(queued.file.originalPath);

            if (!sourceFile) {
                throw new Error("No source found for " + queued.file.originalPath + "!\n" +
                                "Is there a mismatch between the Typescript compiler options and the Karma config?");
            }

            queued.callback({
                isDeclarationFile: (<any> ts).isDeclarationFile(sourceFile),
                moduleFormat: ts.ModuleKind[this.tsconfig.options.module],
                outputText: this.compiledFiles[queued.file.path],
                sourceFile,
                sourceMapText: this.compiledFiles[queued.file.path + ".map"]
            });
        });

        this.emitQueue.length = 0;
    }

    private compileProgram(onProgramCompiled: Function): void {

        let benchmark = new Benchmark();

        if (!this.cachedProgram) {
            this.compilerHost = ts.createCompilerHost(this.tsconfig.options);
            this.hostGetSourceFile = this.compilerHost.getSourceFile;
            this.compilerHost.getSourceFile = this.getSourceFile;
            this.compilerHost.writeFile = (filename, text) => {
                this.compiledFiles[filename] = text;
            };
        }

        this.program = ts.createProgram(this.tsconfig.fileNames, this.tsconfig.options, this.compilerHost);
        this.cachedProgram = this.program;

        this.runDiagnostics(this.program, this.compilerHost);
        this.program.emit();

        this.applyTransforms(() => {
            this.log.info("Compiled %s files in %s ms.", this.tsconfig.fileNames.length, benchmark.elapsed());
            onProgramCompiled();
        });
    }

    private getSourceFile = (
        filename: string,
        languageVersion: ts.ScriptTarget,
        onError?: (message: string) => void): ts.SourceFile => {

        if (this.cachedProgram && !this.isQueued(filename)) {
            let sourceFile = this.cachedProgram.getSourceFile(filename);
            if (sourceFile) {
                return sourceFile;
            }
        }

        return this.hostGetSourceFile(filename, languageVersion, onError);
    }

    private isQueued(filename: string): boolean {
        for (let queued of this.emitQueue) {
            if (queued.file.originalPath === filename) {
                return true;
            }
        }
        return false;
    }

    private applyTransforms(onTransformssApplied: ErrorCallback<Error>): void {

        if (!this.config.transforms.length) {
            process.nextTick(() => {
                onTransformssApplied();
            });
            return;
        }

        async.eachSeries(this.emitQueue, (queued: Queued, onQueueProcessed: ErrorCallback<Error>) => {
            let sourceFile = this.program.getSourceFile(queued.file.originalPath);
            let context = {
                basePath: this.config.karma.basePath,
                filename: queued.file.originalPath,
                fullText: sourceFile.getFullText(),
                sourceFile,
                urlRoot: this.config.karma.urlRoot
            };
            async.eachSeries(this.config.transforms, (transform: Function, onTransformApplied: Function) => {
                process.nextTick(() => {
                    transform(context, (changed: boolean) => {
                        if (changed) {
                            let transpiled = ts.transpileModule(context.fullText, {
                                compilerOptions: this.tsconfig.options,
                                fileName: queued.file.originalPath
                            });
                            this.compiledFiles[queued.file.path] = transpiled.outputText;
                            this.compiledFiles[queued.file.path + ".map"] = transpiled.sourceMapText;
                        }
                        onTransformApplied();
                    });
                });
            }, onQueueProcessed);
        }, onTransformssApplied);
    }

    private runDiagnostics(program: ts.Program, host: ts.CompilerHost): void {
        let diagnostics = ts.getPreEmitDiagnostics(program);
        this.outputDiagnostics(diagnostics, host);
    }

    private outputDiagnostics(diagnostics: ts.Diagnostic[], host?: ts.FormatDiagnosticsHost): void {

        if (diagnostics && diagnostics.length > 0) {

            diagnostics.forEach((diagnostic) => {

                if (ts.formatDiagnostics) { // v1.8+
                    this.log.error(ts.formatDiagnostics([diagnostic], host));
                }
                else { // v1.6, v1.7

                    let output = "";

                    if (diagnostic.file) {
                        let loc = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
                        output += diagnostic.file.fileName.replace(process.cwd(), "") +
                                  "(" + (loc.line + 1) + "," + (loc.character + 1) + "): ";
                    }

                    let category = ts.DiagnosticCategory[diagnostic.category].toLowerCase();
                    output += category + " TS" + diagnostic.code + ": " +
                              ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine) + ts.sys.newLine;

                    this.log.error(output);
                }
            });

            if (this.tsconfig.options.noEmitOnError) {
                ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
            }
        }
    }
}

export = Compiler;
