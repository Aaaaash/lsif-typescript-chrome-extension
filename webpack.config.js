const path = require('path');
const WebpackBarPlugin = require('webpackbar');
const { DefinePlugin } = require('webpack');

const createCssToStringTransfomer = require('./transformer/cssStringTransformer');

const production = process.env.NODE_ENV === 'production';

if (!production) {
    require('dotenv').config();
}

module.exports = {
    entry: {
        content: path.join(__dirname, 'src/content.ts'),
        background: path.join(__dirname, 'src/background.ts'),
        popup: path.join(__dirname, 'src/popup.tsx'),
        inject: path.join(__dirname, 'src/injectScript.ts'),
        options: path.join(__dirname, 'src/options.ts'),
    },
    output: {
        path: path.join(__dirname, 'out'),
        filename: '[name].js'
    },
    devtool: production ? false : 'source-map',
    mode: 'development',
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        getCustomTransformers: (service) => ({
                            before: [
                                createCssToStringTransfomer(service),
                            ]
                        }),
                    },
                }
            },
            {
                // exclude: /node_modules/,
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader' // Creates style nodes from JS strings
                    },
                    {
                        loader: 'css-loader' // Translates CSS into CommonJS
                    }
                ]
            },
            {
                test: /\.svg/,
                use: {
                    loader: 'svg-url-loader',
                    options: {}
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
        new DefinePlugin({
            'global.process.env.LOG_LEVEL': '"debug"',
            'global.process.env.SERVER_URL': JSON.stringify(process.env['SERVER_URL']),
        }),
        new WebpackBarPlugin({
            name: 'LSIF TypeScript',
            color: 'green',
        }),
    ]
};
