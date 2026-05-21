const path = require('path');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');

const devServerHost = process.env.DEV_SERVER_HOST || '127.0.0.1';
const devServerPort = Number.parseInt(process.env.DEV_SERVER_PORT || '8080', 10);

const vueFeatureFlags = {
    __VUE_OPTIONS_API__: JSON.stringify(true),
    __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
};

module.exports = {
    mode: 'development',
    entry: {
        app: [
            'whatwg-fetch',
            './client/css/lighterpack.scss',
            './client/lighterpack.js',
        ],
        share: [
            './client/css/share.scss',
        ],
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]',
                },
            },
            {
                test: /\.scss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require('sass'),
                        },
                    },
                ],
            },
        ],
    },
    resolve: {},
    devServer: {
        host: devServerHost,
        port: devServerPort,
        allowedHosts: 'all',
        historyApiFallback: true,
        hot: true,
        client: {
            logging: 'info',
            overlay: true,
            webSocketURL: {
                hostname: devServerHost,
                port: devServerPort,
                protocol: 'ws',
            },
        },
        devMiddleware: {
            publicPath: '/dist/',
            stats: {
                cached: false,
                cachedAssets: false,
                colors: { level: 2 },
            },
        },
        watchFiles: {
            options: {
                aggregateTimeout: 300,
                poll: 1000,
            },
        },
    },
    performance: {
        hints: false,
    },
    plugins: [
        new VueLoaderPlugin(),
        new webpack.DefinePlugin(vueFeatureFlags),
    ],
};
