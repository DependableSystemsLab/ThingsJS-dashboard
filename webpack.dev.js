const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./src/client/index.jsx",
  mode: "development",
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        options: { presets: ['env', 'react'] }
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.(png|jpg|gif|svg|ttf|woff2|woff|eot)$/,
        use: [{
          loader: 'file-loader',
          options: {}
        }]
      }
    ]
  },
  resolve: { extensions: ['*', '.js', '.jsx'] },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: "./src/client/index.html",
      filename: "../index.html"
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  output: {
    path: path.resolve(__dirname, "dist/app/"),
    publicPath: "/app/",
    filename: "bundle.js"
  },
  devServer: {
    contentBase: path.join(__dirname, "public/"),
    disableHostCheck: true, // SECURITY WARNING: This flag makes the dev server open to public
    host: '0.0.0.0',
    port: 8000,
    proxy: {
      "/fs": "http://localhost:3000",
      "/pubsub": {
        "target": "http://localhost:3000",
        "ws": true
      }
    },
    hotOnly: true
  }
};
