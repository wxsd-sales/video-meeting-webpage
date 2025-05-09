const path = require("path");
const webpack = require("webpack");
require("dotenv").config();
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    index: "./src/index.js",
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    publicPath: "https://wxsd-sales.github.io/video-meeting-webpage/",
  },
  devServer: {
    static: "./dist",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.html$/,
        use: "html-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "public/hangup.html", to: "hangup.html" }, // ✅ copy this file
      ],
    }),
    // new webpack.DefinePlugin({
    //   "process.env": JSON.stringify({
    //     NODE_ENV: JSON.stringify("production"),
    //   }),
    // }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new NodePolyfillPlugin(),
  ],
  resolve: {
    fallback: {
      fs: false,
      vm: false,
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
      querystring: require.resolve("querystring-es3"),
      os: false,
    },
    extensions: [".js"],
  },
  mode: "development",
};
