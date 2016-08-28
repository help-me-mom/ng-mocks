module.exports = function(config) {
  config.set({

    frameworks: ['jasmine', 'requirejs'],

    files: [
        'test-main.js',
        { pattern: 'src/**/*.ts', included: false }
    ],

    preprocessors: {
        '**/*.ts': ['karma-typescript', 'coverage']
    },

    karmaTypescript: {
        tsconfigPath: 'tsconfig.json',
        options: {
            sourceMap: true,
            target: 'es5',
            module: 'amd'
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
