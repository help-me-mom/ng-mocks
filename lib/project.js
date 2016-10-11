function Project() {

    var glob = require("glob"),
        ts = require("typescript");

    function resolve(karmaConfig, log) {

        log.debug("resolving project path %s", karmaConfig.basePath);

        var compilerOptions = resolveOptions(karmaConfig),
            resolvedFilenames = resolvePaths(karmaConfig, compilerOptions);

        // TODO: move into compiler.js?
        if(!compilerOptions.noLib) {
            resolvedFilenames.push(ts.getDefaultLibFilePath(compilerOptions));
        }

        log.debug("project path %s resolved", karmaConfig.basePath);

        return {
            basePath: karmaConfig.basePath,
            filenames: resolvedFilenames,
            options: compilerOptions
        };
    }

    function resolveOptions(karmaConfig) {

        // TODO: merge with config.karmaTypescript.tsconfigPath and config.karmaTypescript.compilerOptions
        karmaConfig = karmaConfig || {};

        return {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
            jsx: ts.JsxEmit.React,
            noEmitOnError: false,
            noImplicitAny: true,
            experimentalDecorators: true,
            sourceMap: true
        };
    }

    function resolvePaths(karmaConfig){

        // TODO: resolve paths using project tsconfig from config.karmaTypescript.tsconfigPath
        // TODO: resolve types using project tsconfig.compilerOptions.types|typesRoot and/or
        //       typeFiles = glob.sync(config.basePath + "/node_modules/@types/**/*.d.ts"), for 2.0+

        return glob.sync(karmaConfig.basePath + "/!(node_modules)/**/*.+(ts|tsx)");/*.filter(function(filename){
            return filename.indexOf("x-performance") === -1;
        });*/
    }

    this.resolve = resolve;
}

module.exports = Project;
