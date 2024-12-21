import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

export default (env, argv) => {
    const isDevelopment = argv.mode === 'development';

    return {
        target: 'web',
        mode: isDevelopment ? 'development' : 'production',
        entry: {
            index: './src/index.ts',
        },
        output: {
            filename: '[name].bundle.js',
            chunkFilename: '[name].bundle.js',
            path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'public_html/scripts'),
            clean: true,
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: false,
                            },
                        },
                    ],
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            alias: {
                '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
            },
        },
        cache: {
            type: 'filesystem',
            buildDependencies: {
                config: [__filename],
            },
        },
        devtool: isDevelopment ? 'source-map' : false,
        optimization: {
            splitChunks: {
                chunks: 'all', // Split both synchronous and asynchronous chunks
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                },
            },
            minimize: !isDevelopment,
        },
        bail: true,
    };
};
