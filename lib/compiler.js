function Compiler() {

    var ts = require("typescript"),
        basePath,
        existingOptions,
        tsconfig,
        log,
        program,
        compiledFiles = {},
        sourceFileCache = {};

    function compileProject(_basePath, _existingOptions, _log) {

        basePath = _basePath;
        existingOptions = _existingOptions;
        log = _log;

        log.info("Compiling project using Typescript %s", ts.version);

        resolveTsconfig();
        compile();
    }

    function compileFile(filename, originalFilename) {

        var sourceFile = sourceFileCache[originalFilename];

        if(!sourceFile) {

            throw new Error("No source found for " + originalFilename + "! Is there a mismatch between the Typescript compiler options and the Karma config?");
        }

        if(sourceFile.version !== 0) {

            log.debug("Changed: %s", originalFilename);
            compile(originalFilename);
        }

        sourceFile.version++;

        return {
            outputText: compiledFiles[filename],
            sourceMapText: compiledFiles[filename + ".map"],
            imports: sourceFileCache[originalFilename].imports
        };
    }

    function getModuleFormat() {

        return ts.ModuleKind[tsconfig.options.module] || "unknown";
    }

    function resolveTsconfig() {

        var configFileName = ts.findConfigFile(basePath, ts.sys.fileExists) || "",
            configFileText,
            configFileJson = {
                config: {}
            };

        convertOptions(existingOptions);

        if(configFileName) {

            if(ts.parseConfigFile) { // v1.6

                configFileJson = ts.readConfigFile(configFileName);
            }
            else if(ts.parseConfigFileTextToJson) { // v1.7+

                configFileText = ts.sys.readFile(configFileName);
                configFileJson = ts.parseConfigFileTextToJson(configFileName, configFileText);
            }
            else {
                log.error("karma-typescript doesn't know how to use Typescript %s :(", ts.version);
                process.exit(1);
            }
        }

        if(ts.parseConfigFile) {

            tsconfig = ts.parseConfigFile(configFileJson.config, ts.sys, ts.getDirectoryPath(configFileName));
            tsconfig.options = ts.extend(existingOptions, tsconfig.options);
        }
        else if(ts.parseJsonConfigFileContent) {

            tsconfig = ts.parseJsonConfigFileContent(configFileJson.config, ts.sys, ts.getDirectoryPath(configFileName), existingOptions, configFileName);
        }

        delete tsconfig.options.outDir;
        delete tsconfig.options.outFile;

        outputDiagnostics(tsconfig.errors);
    }

    function convertOptions(options) {

        if(options) {

            var optionNameMap = ts.getOptionNameMap().optionNameMap;

            setOption(options, optionNameMap, "module");
            setOption(options, optionNameMap, "target");
            setOption(options, optionNameMap, "jsx");
        }
    }

    function setOption(options, optionNameMap, key) {

        if(options[key] && typeof options[key] === "string") {

            options[key] = optionNameMap[key].type[options[key].toLowerCase()] || 0;
        }
    }

    function compile(originalFilename) {

        var start = benchmark(),
            compilerHost = ts.createCompilerHost(tsconfig.options);

        compilerHost.getSourceFile = function(filename, languageVersion) {
            return getSourceFile(filename, originalFilename, languageVersion);
        };

        compilerHost.writeFile = function(filename, text) {
            compiledFiles[filename] = text;
        };

        compilerHost.getCurrentDirectory = function() {
            return basePath;
        };

        program = ts.createProgram(tsconfig.fileNames, tsconfig.options, compilerHost, program);

        runDiagnostics(program, compilerHost);

        program.emit();

        log.info("Compiled %s files in %s ms.", tsconfig.fileNames.length, benchmark(start));
    }

    function getSourceFile(filename, originalFilename, languageVersion) {

        var absolutePath = ts.getNormalizedAbsolutePath(filename, ts.sys.getCurrentDirectory()),
            cachedItem = sourceFileCache[absolutePath],
            sourceText,
            sourceFile;

        if(cachedItem && originalFilename === absolutePath) {
            log.debug("Deleted from cache: %s", absolutePath);
            delete cachedItem.sourceFile;
        }

        if(cachedItem && cachedItem.sourceFile) {
            log.debug("Using cached version: %s", absolutePath);
            return cachedItem.sourceFile;
        }

        log.debug("Compiling: %s", absolutePath);

        sourceText = ts.sys.readFile(absolutePath);

        if(!sourceText) {
            log.error("No source found for " + absolutePath);
        }

        sourceFile = ts.createSourceFile(absolutePath, sourceText, languageVersion);

        sourceFileCache[absolutePath] = {
            sourceFile: sourceFile,
            imports: getImports(sourceFile),
            version: cachedItem ? cachedItem.version : 0
        };

        return sourceFile;
    }

    function getImports(sourceFile) {

        var imports = [];

        sourceFile.statements.forEach(function(statement){

            if(statement.moduleSpecifier) {

                imports.push(statement.moduleSpecifier.text);
            }
        });

        return imports;
    }

    function runDiagnostics(program, host) {

        var diagnostics = ts.getPreEmitDiagnostics(program);

        outputDiagnostics(diagnostics, host);
    }

    function outputDiagnostics(diagnostics, host) {

        if(diagnostics && diagnostics.length > 0) {

            diagnostics.forEach(function(diagnostic){

                if(ts.formatDiagnostics) { // v1.8+

                    log.error(ts.formatDiagnostics([diagnostic], host));
                }
                else { // v1.6, v1.7

                    var output = "";

                    if (diagnostic.file) {
                        var loc = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
                        output += diagnostic.file.fileName.replace(process.cwd(), "") + "(" + (loc.line + 1) + "," + (loc.character + 1) + "): ";
                    }

                    var category = ts.DiagnosticCategory[diagnostic.category].toLowerCase();
                    output += category + " TS" + diagnostic.code + ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine) + ts.sys.newLine;

                    log.error(output);
                }
            });

            if(tsconfig.options.noEmitOnError) {

                ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
            }
        }
    }

    function benchmark(start) {

        if(!start) {
            return process.hrtime();
        }

        var end = process.hrtime(start);
        return Math.round((end[0]*1000) + (end[1]/1000000));
    }

    this.compileProject = compileProject;
    this.compileFile = compileFile;
    this.getModuleFormat = getModuleFormat;
}

module.exports = Compiler;
