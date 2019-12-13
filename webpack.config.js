const path = require('path');

module.exports = {
    mode: 'production',
    entry: {
        index: './public/src/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'public/js'),
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }, {
            test: /\.hbs$/,
            use: 'raw-loader'
        }]
    }
};