const path = require('path');

module.exports = [
  {
    mode: 'production',
    devtool: 'source-map',
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
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: path.resolve(__dirname, './libs/ng-mocks/tsconfig.build.cjs.json'),
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
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: path.resolve(__dirname, './libs/ng-mocks/tsconfig.build.mjs.json'),
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
