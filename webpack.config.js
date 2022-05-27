/* eslint-disable no-undef */

module.exports = {
  mode: 'production',
  entry: {
    index: `${__dirname}/src/index.ts`,
  },
  output: {
    filename: '[name].js',
    path: `${__dirname}/lib`,
    libraryTarget: 'commonjs2',
  },
  externals: {
    react: 'react',
    mobx: 'mobx',
    'mobx-react': 'mobx-react',
    'mobx-react-lite': 'mobx-react-lite',
    'react-dom': 'react-dom',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', 'jsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
  optimization: {
    minimize: true,
  },
};
