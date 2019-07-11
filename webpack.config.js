const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const path = require("path");

module.exports = {
    entry: {
        background: path.join(__dirname, "src/background.ts"),
        content: path.join(__dirname, "src/content.ts"),
        popup: path.join(__dirname, "src/popup.tsx"),
    },
    output: {
        path: path.join(__dirname, "out"),
        filename: "[name].js"
    },
    mode: "development",
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: "ts-loader"
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    plugins: [
        new ChromeExtensionReloader({
            port: 9090,
            reloadPage: true,
            entries: {
                background: "background",
                content: "content",
                popup: 'popup'
            }
        }),
    ]
};
