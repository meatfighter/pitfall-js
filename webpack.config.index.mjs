import path from 'path';
import { fileURLToPath } from 'url';

export default {
    mode: 'production',
    entry: {
        index: './src/index.ts',
    },
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'public_html/scripts'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
        },
    },
};