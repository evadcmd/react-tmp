// pathモジュールを読み(output.pathに絶対パスを指定するため)
const path = require('path');

module.exports = {
    mode: 'production', // [none | development | production(デフォルト)]
    entry: './src/index.js', // [string|Array<string>]
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
        ]
    }
};