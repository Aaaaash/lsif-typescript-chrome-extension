const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const { DefinePlugin } = require('webpack');
const path = require('path');

module.exports = {
    entry: {
        background: path.join(__dirname, 'src/background.ts'),
        content: path.join(__dirname, 'src/content.ts'),
        popup: path.join(__dirname, 'src/popup.tsx'),
    },
    output: {
        path: path.join(__dirname, 'out'),
        filename: '[name].js'
    },
    mode: 'development',
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: 'ts-loader'
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
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
        new ChromeExtensionReloader({
            port: 9090,
            reloadPage: true,
            entries: {
                background: 'background',
                content: 'content',
                popup: 'popup'
            }
        }),
        new DefinePlugin({
            'global.process.env.LOG_LEVEL': '"debug"',
        }),
    ]
};
