const { merge } = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
        open: true, // otomatis buka di browser
        headers: {
            'Access-Control-Allow-Origin': '*', // mengizinkan CORS
        }
    },
});
