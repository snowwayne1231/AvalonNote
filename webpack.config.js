const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const Dotenv = require('dotenv-webpack');

const dir_src = path.resolve(__dirname, 'src');
const dir_dist = path.resolve(__dirname, 'www');
const isProduction = process.env.NODE_ENV == 'production';

module.exports = {
    mode: isProduction ? 'production' : 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: dir_dist,
    },

    entry: `${dir_src}/index.js`,
    output: {
        filename: '[hash][name].js',
        path: dir_dist,
        publicPath: '/',
    },
    resolve: {
        extensions: ['.js', '.json', '.vue'],
        modules: [dir_src, 'node_modules'],
        alias: {
            src: dir_src,
            assets: path.resolve(__dirname, 'assets'),
            'vue$': 'vue/dist/vue.esm.js'
        },
    },

    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    isProduction ? 'style-loader' : 'style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader',
                ],
            },
            {
                test: /\.xml$/,
                use: [
                    'xml-loader'
                ],
            },
            {
                test: /\.(csv|tsv)$/,
                use: [
                    'csv-loader'
                ],
            },
            {
                test: /\.vue$/,
                use: [
                    'vue-loader'
                ],
            },
            {
                test: /\.js.?$/,
                use: [
                    'babel-loader'
                ],
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            _: "underscore"
        }),
        new HtmlWebpackPlugin({
            filename: `${dir_dist}/index.html`,
            template: `${dir_src}/index.ejs`,
            inject: true,
        }),
        new VueLoaderPlugin(),
        new Dotenv({
            systemvars: true,
            safe: true,
        }),
    ],
};