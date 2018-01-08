import * as lodash from "lodash";
import * as ts from "typescript";

import { Logger } from "log4js";

import { Benchmark } from "../shared/benchmark";
import { Configuration } from "../shared/configuration";
import { File } from "../shared/file";
import { EventType, Project } from "../shared/project";
import { CompileCallback } from "./compile-callback";

type CompiledFiles = { [key: string]: string; };

type Queued = {
    file: File;
    callback: CompileCallback;
};

export class Compiler {

    private cachedProgram: ts.Program;
    private compiledFiles: CompiledFiles = {};
    private compilerHost: ts.CompilerHost;
    private emitQueue: Queued[] = [];
    private errors: string[] = [];
    private hostGetSourceFile: {(filename: string, languageVersion: ts.ScriptTarget,
                                 onError?: (message: string) => void): ts.SourceFile};
    private program: ts.Program;

    private compileDeferred: () => void;

    constructor(private config: Configuration, private log: Logger, private project: Project) {
        config.whenReady(() => {
            this.log.debug("Setting up deferred project compilation");
            this.compileDeferred = lodash.debounce(() => {
                this.compileProject();
            }, this.config.compilerDelay);
        });
    }

    public compile(file: File, callback: CompileCallback): void {

        this.emitQueue.push({
            file,
            callback
        });

        this.compileDeferred();
    }

    private compileProject(): void {

        this.log.info("Compiling project using Typescript %s", ts.version);

        if (this.project.handleFileEvent() === EventType.FileSystemChanged) {
            this.setupRecompile();
        }

        let benchmark = new Benchmark();
        let tsconfig = this.project.getTsconfig();

        this.outputDiagnostics(tsconfig.errors);

        this.program = ts.createProgram(tsconfig.fileNames, tsconfig.options, this.compilerHost);
        this.cachedProgram = this.program;

        this.runDiagnostics(this.program, this.compilerHost);
        this.program.emit();
        this.log.info("Compiled %s files in %s ms.", tsconfig.fileNames.length, benchmark.elapsed());
        this.onProgramCompiled();
    }

    private setupRecompile(): void {
        this.cachedProgram = undefined;
        this.compilerHost = ts.createCompilerHost(this.project.getTsconfig().options);
        this.hostGetSourceFile = this.compilerHost.getSourceFile;
        this.compilerHost.getSourceFile = this.getSourceFile;
        this.compilerHost.writeFile = (filename, text) => {
            this.compiledFiles[filename] = text;
        };
    }

    private onProgramCompiled(): void {

        this.emitQueue.forEach((queued) => {

            let sourceFile = this.program.getSourceFile(queued.file.originalPath);

            if (!sourceFile) {
                throw new Error("No source found for " + queued.file.originalPath + "!\n" +
                                "Is there a mismatch between the Typescript compiler options and the Karma config?");
            }

            let ambientModuleNames = (<any> sourceFile).ambientModuleNames;

            queued.callback({
                ambientModuleNames,
                hasError: this.errors.indexOf(queued.file.originalPath) !== -1,
                isAmbientModule: ambientModuleNames && ambientModuleNames.length > 0,
                isDeclarationFile: this.fileExtensionIs(sourceFile.fileName, ".d.ts"),
                outputText: this.compiledFiles[queued.file.path],
                sourceFile,
                sourceMapText: this.compiledFiles[queued.file.path + ".map"]
            });
        });

        this.emitQueue.length = 0;
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

    private runDiagnostics(program: ts.Program, host: ts.CompilerHost): void {
        this.errors = [];
        let diagnostics = ts.getPreEmitDiagnostics(program);
        this.outputDiagnostics(diagnostics, host);
    }

    private outputDiagnostics(diagnostics: ts.Diagnostic[], host?: ts.FormatDiagnosticsHost): void {

        if (!diagnostics || diagnostics.length === 0) {
            return;
        }

        diagnostics.forEach((diagnostic) => {

            if (diagnostic.file) {
                this.errors.push(diagnostic.file.fileName);
            }

            if (ts.formatDiagnostics && host) { // v1.8+
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

        if (this.project.getTsconfig().options.noEmitOnError) {
            ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
        }
    }

    private fileExtensionIs(path: string, extension: string) {
        return path.length > extension.length && this.endsWith(path, extension);
    }

    private endsWith(str: string, suffix: string) {
        let expectedPos = str.length - suffix.length;
        return expectedPos >= 0 && str.indexOf(suffix, expectedPos) === expectedPos;
    }
}
