function Compiler() {

    var ts = require("typescript"),
        context,
        log,
        program,
        compiledFiles = {},
        sourceFileCache = {};

    function compileProject(_context_, _log_) {

        context = _context_;
        log = _log_;

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
            sourceMapText: compiledFiles[filename + ".map"]
        };
    }

    function compile(originalFilename) {

        var start = benchmark(),
            compilerHost = {
                getSourceFile: function (filename, languageVersion) {
                    return getSourceFile(filename, originalFilename, languageVersion);
                },
                writeFile: function (filename, text) {
                    compiledFiles[filename] = text;
                },
                getDefaultLibFileName: function () {
                    return ts.getDefaultLibFilePath(context.options);
                },
                useCaseSensitiveFileNames: function () {
                    return ts.sys.useCaseSensitiveFileNames;
                },
                getCanonicalFileName: function (filename) {
                    return ts.sys.useCaseSensitiveFileNames ? filename : filename.toLowerCase();
                },
                getCurrentDirectory: function () {
                    return ts.sys.getCurrentDirectory();
                },
                getNewLine: function () {
                    return ts.getNewLineCharacter(context.options);
                },
                fileExists: function (filename) {
                    return ts.sys.fileExists(filename);
                }
            };

        program = ts.createProgram(context.filenames, context.options, compilerHost, program);

        runDiagnostics(program);

        program.emit();

        log.info("Compiled %s files in %s ms.", context.filenames.length, benchmark(start));
    }

    function getSourceFile(filename, originalFilename, languageVersion) {

        var cachedItem = sourceFileCache[filename],
            sourceText,
            sourceFile;

        if(cachedItem && originalFilename === filename) {
            log.debug("Deleted from cache: %s", filename);
            delete cachedItem.sourceFile;
        }

        if(cachedItem && cachedItem.sourceFile) {
            log.debug("Using cached version: %s", filename);
            return cachedItem.sourceFile;
        }

        log.debug("Compiling: %s", filename);

        sourceText = ts.sys.readFile(filename);
        sourceFile = ts.createSourceFile(filename, sourceText, languageVersion);

        sourceFileCache[filename] = {
            sourceFile: sourceFile,
            version: cachedItem ? cachedItem.version : 0
        };

        return sourceFile;
    }

    function runDiagnostics(program) {

        var diagnostics = ts.getPreEmitDiagnostics(program);

        diagnostics.forEach(function(diagnostic){
            log.error("TS:%s %s", diagnostic.code, diagnostic.messageText);
        });

        if(context.options.noEmitOnError) {
            throw new Error("Compilation failed");
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
}

module.exports = Compiler;
