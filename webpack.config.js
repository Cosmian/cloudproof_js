const path = require('path')
const webpack = require('webpack');

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
	alias: {
            process: "process/browser"
        }
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
        new webpack.EnvironmentPlugin({
            SERVER: 'http://localhost:3000', // default backend URI
        }),
        // Work around for Buffer is undefined:
        // https://github.com/webpack/changelog-v5/issues/10
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ]
}
