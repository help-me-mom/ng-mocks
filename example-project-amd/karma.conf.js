module.exports = function(config) {
  config.set({

    frameworks: ['jasmine', 'requirejs'],

    files: [
        'test-main.js',
        { pattern: 'src/**/*.ts', included: false }
    ],

    preprocessors: {
        '**/*.ts': ['karma-typescript']
    },

    karmaTypescript: {
        tsconfigPath: 'tsconfig.json',
        options: {
            sourceMap: true,
            target: 'es5',
            module: 'amd'
        }
    },

    browsers: ['Chrome']
  })
}
