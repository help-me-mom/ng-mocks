var fs = require('fs');
var path = require('path');

var createTypescriptPreprocessor = function(args, config, logger, helper) {

    global.remapIstanbulContent = global.remapIstanbulContent || {};
    config = config || {};

    var tsconfigPath;
    var tsconfig;
    var compilerOptions;
    var log = logger.create('preprocessor.karma-typescript');
    var tsc = require('typescript');

    var transformPath = args.transformPath || config.transformPath || function (filepath) {
        return filepath.replace(/\.ts$/, '.js')
    }

    log.info('Using Typescript %s', tsc.version);
    log.debug('Compiler options from karma configuration:\n%s', JSON.stringify(config.options, null, 4));

    if (config.tsconfigPath) {

        try {

            tsconfigPath = process.cwd() + '/' + config.tsconfigPath;
            tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

            log.info('Using tsconfig from %s', tsconfigPath);
            log.debug('Compiler options from %s:\n%s', tsconfigPath, JSON.stringify(tsconfig.compilerOptions, null, 4));
        }
        catch(error) {

            log.warn(error.message);
        }
    }

    if (tsconfig) {

        compilerOptions = helper.merge(tsconfig.compilerOptions || {}, config.options || {});
        log.debug('Compiler options after merge with karma configuration and tsconfig:\n%s', JSON.stringify(compilerOptions, null, 4));
    }

    return function(content, file, done) {

        var transpileOutput,
            reportDiagnostics = false,
            moduleName = path.relative(process.cwd(), file.originalPath),
            map,
            result;

        log.debug('Processing "%s".', file.originalPath);

        try {

            file.path = transformPath(file.originalPath);
            transpileOutput = tsc.transpileModule(content, { compilerOptions: compilerOptions }, reportDiagnostics, moduleName);
            result = transpileOutput.outputText;

            if(transpileOutput.sourceMapText) {

                map = JSON.parse(transpileOutput.sourceMapText);
                map.sources[0] = path.basename(file.originalPath);
                map.sourcesContent = [content];
                map.file = path.basename(file.path);
                file.sourceMap = map;
                datauri = 'data:application/json;charset=utf-8;base64,' + new Buffer(JSON.stringify(map)).toString('base64');

                result = transpileOutput.outputText.replace('//# sourceMappingURL=module.js.map', ''); // TODO: Is there an compiler option to disable this?
                result += '\n//# sourceMappingURL=' + datauri + '\n';
            }

            global.remapIstanbulContent[file.originalPath] = result; // TODO: There must be a better way to share data between Karma plugins...
            done(null, result);
        }
        catch(e) {

            log.error('%s\n at %s\n%s', e.message, file.originalPath, e.stack);
            return done(e, null);
        }
    };
};

createTypescriptPreprocessor.$inject = ['args', 'config.karmaTypescript', 'logger', 'helper'];

module.exports = {
    'preprocessor:karma-typescript': ['factory', createTypescriptPreprocessor]
};
