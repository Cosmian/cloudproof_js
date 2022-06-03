const path = require('path')
const Dotenv = require('dotenv-webpack');

module.exports = {
    mode: 'development',
    entry: [
        "./src/site/index.ts"
    ],
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: [/node_modules/, /\.test.tsx?$/],
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'site')
    },
    devServer: {
        contentBase: './site',
    },
    experiments: {
        asyncWebAssembly: true,
    },
    plugins: [
      new Dotenv(),
    ]
}
