import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    base: './',
    optimizeDeps: {
        esbuildOptions: {
            // Node.js global to browser globalThis
            define: {
                global: 'globalThis'
            },
            // Enable esbuild polyfill plugins
            plugins: [
                NodeGlobalsPolyfillPlugin({ buffer: true }),
                NodeModulesPolyfillPlugin()
            ]
        }
    },
    build: {
        minify: false,
        target: 'esnext',
        rollupOptions: {
            plugins: [visualizer()],
        },
    },
    resolve: {
        alias: {
            buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
            '@cfxjs/use-wallet/dist/ethereum': path.resolve(__dirname, '../../node_modules/@cfxjs/use-wallet-react/ethereum'),
            '@cfxjs/use-wallet': path.resolve(__dirname, '../../node_modules/@cfxjs/use-wallet-react/conflux/Fluent'),
        },
    },
});
