const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        app: './src/app.js', 
        favorite: './src/view/Favorite.js',  // Menambahkan Favorite.js
        detailStory: './src/presenter/DetailStoryPresenter.js' 
    },
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
                    { from: 'src/view/Favorite.js', to: 'view/Favorite.js' },  // Salin Favorite.js
                    { from: 'src/presenter/DetailStoryPresenter.js', to: 'presenter/DetailStoryPresenter.js' } // Salin DetailStoryPresenter.js             
                ],
            }),
        ],
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
            clean: true, 
        },
};
