import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

const TestServerUrl = 'https://test-rigel.confluxhub.io';
const ProxyConfig = {
    target: TestServerUrl,
    changeOrigin: true,
};

export default defineConfig({
    plugins: [react()],
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
