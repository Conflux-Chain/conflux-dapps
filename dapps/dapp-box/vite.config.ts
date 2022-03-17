import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

const TestServerUrl = 'https://test.shuttleflow.confluxnetwork.org';
const ProxyConfig = {
    target: TestServerUrl,
    // target: 'https://shuttleflow.io',
    changeOrigin: true,
};

export default defineConfig({
    plugins: [react()],
    base: './',
    optimizeDeps: {
        esbuildOptions: {
            // Node.js global to browser globalThis
            define: {
                global: 'globalThis',
            },
            // Enable esbuild polyfill plugins
            plugins: [NodeGlobalsPolyfillPlugin({ buffer: true, process: true }), NodeModulesPolyfillPlugin()],
        },
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
            '@base': path.resolve(__dirname, 'node_modules'),
            '@modules': path.resolve(__dirname, 'src/modules'),
            '@hooks': path.resolve(__dirname, 'src/hooks'),
            '@assets': path.resolve(__dirname, 'src/assets'),
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@store': path.resolve(__dirname, 'src/store'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@components': path.resolve(__dirname, 'src/components'),
            '@router': path.resolve(__dirname, 'src/router'),
            '@contracts': path.resolve(__dirname, 'src/contracts'),
            buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
        },
    },
    server: {
        proxy: {
            '/rpcshuttleflow': ProxyConfig,
            '/rpcsponsor': ProxyConfig,
        },
    },
});
