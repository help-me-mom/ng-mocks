const path = require('path');

module.exports = [
  {
    mode: 'production',
    devtool: 'source-map',
    entry: './libs/ng-mocks/src/index.ts',
    target: ['web', 'es5'],
    output: {
      path: path.resolve(__dirname, './dist/libs/ng-mocks/'),
      filename: 'index.js',
      library: {
        type: 'umd',
      },
    },
    externals: /^@angular\//,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
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
    mode: 'production',
    devtool: 'source-map',
    entry: './libs/ng-mocks/src/index.ts',
    target: ['web', 'es5'],
    experiments: {
      outputModule: true,
    },
    output: {
      path: path.resolve(__dirname, './dist/libs/ng-mocks/'),
      filename: 'index.mjs',
      library: {
        type: 'module',
      },
      environment: { module: true },
    },
    externals: /^@angular\//,
    externalsType: 'module',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: path.resolve(__dirname, './libs/ng-mocks/tsconfig.esm.json'),
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
