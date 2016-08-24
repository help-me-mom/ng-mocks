module.exports = function(config) {
  config.set({

    frameworks: ['jasmine', 'commonjs'],

    files: [
        { pattern: 'src/**/*.ts' }
    ],

    preprocessors: {
        '**/*.ts': ['karma-typescript', 'commonjs']
    },

    karmaTypescript: {
        tsconfigPath: 'tsconfig.json',
        options: {
            sourceMap: true,
            target: 'es5',
            module: 'commonjs'
        }
    },

    browsers: ['Chrome']
  })
}
