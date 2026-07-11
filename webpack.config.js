const path = require('node:path');

const performance = {
  hints: 'error',
  maxAssetSize: 800 * 1024,
  maxEntrypointSize: 800 * 1024,
};

module.exports = [
  {
    mode: process.env.MODE || 'production',
    devtool: process.env.MODE ? false : 'source-map',
    entry: './libs/ng-mocks/src/index.ts',
    target: ['web', 'es3'],
    output: {
      path: path.resolve(__dirname, './dist/libs/ng-mocks/'),
      filename: 'index.js',
      library: {
        type: 'umd',
      },
      globalObject: 'this',
    },
    externals: /^@angular\//,
    performance,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                compilerOptions: {
                  downlevelIteration: true,
                  ignoreDeprecations: '6.0',
                },
                configFile: path.resolve(__dirname, './libs/ng-mocks/tsconfig.json'),
                transpileOnly: true,
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.cjs', '.mjs', '.ts', '.json'],
    },
  },
  {
    mode: process.env.MODE || 'production',
    devtool: process.env.MODE ? false : 'source-map',
    entry: './libs/ng-mocks/src/index.ts',
    target: ['web', 'es2015'],
    experiments: {
      outputModule: true,
    },
    output: {
      path: path.resolve(__dirname, './dist/libs/ng-mocks/'),
      filename: 'index.mjs',
      library: {
        type: 'module',
      },
      globalObject: 'this',
    },
    externals: /^@angular\//,
    performance,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: path.resolve(__dirname, './libs/ng-mocks/tsconfig.json'),
                compilerOptions: {
                  module: 'ES2015',
                  moduleResolution: 'bundler',
                  target: 'ES2015',
                },
                transpileOnly: true,
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.cjs', '.mjs', '.ts', '.json'],
    },
  },
];
