const path = require("path")
const webpack = require("webpack")

module.exports = {
  mode: "development",
  entry: ["./index.js"],
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: [/node_modules/, /\.test.tsx?$/],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: ["node_modules", "src"],
    alias: {
      process: "process/browser",
    },
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    static: "./site",
  },
  experiments: {
    asyncWebAssembly: true,
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      SERVER: "http://localhost:3000", // default server URI
    }),
    // Work around for Buffer is undefined:
    // https://github.com/webpack/changelog-v5/issues/10
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
}
