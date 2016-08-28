module.exports = function(config) {
  config.set({

    frameworks: ['jasmine', 'commonjs'],

    files: [
        { pattern: 'src/**/*.ts' }
    ],

    preprocessors: {
        '**/*.ts': ['karma-typescript', 'commonjs', 'coverage']
    },

    karmaTypescript: {
        tsconfigPath: 'tsconfig.json',
        options: {
            sourceMap: true,
            target: 'es5',
            module: 'commonjs'
        }
    },

    reporters: ['progress', 'coverage', 'karma-remap-istanbul'],

    remapIstanbulReporter: {
        reports: {
            html: 'coverage'
        },
        // Depending on karma-remap-istanbul pull request #19 'Added remap config options'
        remapOptions: {
            exclude: '.spec.ts',
            readFile: function(filepath) {
                return global.remapIstanbulContent[filepath];
            },
            warn: function(message){}
        }
    },

    browsers: ['Chrome']
  })
}
