

<!-- toc -->

- [Cloudproof Javascript Lib](#cloudproof-javascript-lib)
  * [Getting started](#getting-started)
  * [Using in Javascript projects](#using-in-javascript-projects)
  * [Using in WebPack (not in Node)](#using-in-webpack-not-in-node)
  * [Versions Correspondence](#versions-correspondence)
  * [npm version](#npm-version)

<!-- tocstop -->

# Cloudproof Javascript Lib

The library provides a Typescript-friendly API to the **Cloudproof Encryption** product of the [Cosmian Ubiquitous Encryption platform](https://cosmian.com).

## Getting started

Please [check the online documentation](https://docs.cosmian.com/cloudproof_encryption/use_cases_benefits/) for details on using the CloudProof APIs.

## Using in Javascript projects

This library is free software and is available on NPM public repository.

```bash
npm i cloudproof_js
```

(version before 3.1.0 were called cosmian_js_lib)

## Using in WebPack (not in Node)

The project is supported in WebPack and can be used with this configuration:

Context of `webpack.config.js`:

```
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
      SERVER: "http://localhost:3000", // default backend URI
    }),
    // Work around for Buffer is undefined:
    // https://github.com/webpack/changelog-v5/issues/10
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
}
```

Then, add these dependencies to your package.json:

```
  "dependencies": {
    "cloudproof_js": "X.Y.Z",
    "webpack": "^5.74.0"
  },
  "devDependencies": {
    "webpack-cli": "^4.10.0",
    "webpack-dev-server": "^4.11.1"
  }

```

And finally run:

```
npx webpack serve
```

**This project DOES NOT support Node.**

## Versions Correspondence

Local encryption and decryption with [CoverCrypt](https://github.com/Cosmian/cover_crypt) and SSE Findex Cosmian scheme use WASM libraries which are transparent for Javascript/Typescript usage.

This table shows the minimum version correspondence between the various components.

| KMS Server | `cloudproof_js` | CoverCrypt lib | Findex |
| ---------- | --------------- | -------------- | ------ |
| 2.2.0      | 1.0.6           | 6.0.1          | 0.5.0  |
| 2.3.0      | 3.1.0           | 6.0.7          | 0.7.0  |
| 2.3.0      | 3.1.0, 4.\*     | 6.0.7          | 0.7.0  |
| 3.0.0      | 5.0.0           | 7.0.0          | 0.10.0 |

## npm version

```
{
  cloudproof_js: '3.1.0',
  npm: '8.6.0',
  node: '18.0.0',
  v8: '10.1.124.8-node.13',
  uv: '1.43.0',
  zlib: '1.2.11',
  brotli: '1.0.9',
  ares: '1.18.1',
  modules: '108',
  nghttp2: '1.47.0',
  napi: '8',
  llhttp: '6.0.4',
  openssl: '3.0.2+quic',
  cldr: '41.0',
  icu: '71.1',
  tz: '2022a',
  unicode: '14.0',
  ngtcp2: '0.1.0-DEV',
  nghttp3: '0.1.0-DEV'
}
```
