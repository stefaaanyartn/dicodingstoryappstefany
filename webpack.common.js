const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/app.js', 
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'], 
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './index.html', 
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'public/icons', to: 'icons' }, // Copy assets folder
                    { from: 'public/icons/favicon-96x96.png', to: 'favicon.png' },
                    { from: 'public/manifest.json', to: '' }, // Tambahkan ini
                    { from: 'service-worker.js', to: '' }, // Copy service worker
                ],
            }),
        ],
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'dist'),
            clean: true, 
        },
};
