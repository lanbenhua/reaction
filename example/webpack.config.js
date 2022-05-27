/* eslint-disable no-undef */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const bodyParser = require('body-parser');

module.exports = {
  mode: 'development',
  entry: {
    app: `${__dirname}/index.ts`,
    // app: `${__dirname}/timeout.ts`,
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../dist'),
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.(css|less)$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
      {
        test: /\.ttf$/,
        use: ['file-loader'],
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, '../dist'),
    compress: true,
    port: 3001,
    https: false,
    before: (app) => {
      let retry = 0;
      app.use('/api', bodyParser.json());
      app.get('/api/retry/success', (req, res) => {
        retry = 0;
        res.status(200).end(JSON.stringify({ success: true, url: req.originalUrl }));
      });

      app.get('/api/slow/3', (req, res) => {
        retry++;
        setTimeout(() => {
          // if (retry === 2) throw new Error('test retry error');
          if (retry > 4) {
            return res.status(200).end(JSON.stringify({ success: true, url: req.originalUrl }));
          }
          return res.status(500).end(JSON.stringify({ error: 'internal system error' }));
        }, 3000);
      });

      app.get('/api/slow/:id', (req, res) => {
        setTimeout(() => {
          res.status(200).end(JSON.stringify({ success: true, url: req.originalUrl }));
        }, 8000 + 5000 * Math.random(0, 1));
      });

      app.get('/api/fast/:id', (req, res) => {
        res.status(200).end(JSON.stringify({ success: true, url: req.originalUrl }));
      });

      app.post('/api/serial', (req, res) => {
        const params = req.body;
        setTimeout(() => {
          res.status(200).end(
            JSON.stringify(
              Math.random(0, 1) > 0.3
                ? { success: true, data: { id: params[0] } }
                : {
                    success: false,
                  }
            )
          );
        }, 2000);
      });
    },
  },
  plugins: [new HtmlWebpackPlugin()],
  watch: true,
};
