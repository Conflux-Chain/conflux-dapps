import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const TestServerUrl = 'https://test-rigel.confluxhub.io';
const ProxyConfig = {
    target: TestServerUrl,
    changeOrigin: true,
};

export default defineConfig({
    plugins: [react()],
    base: './',
    build: {
        minify: false,
    },
    resolve: {
        alias: { web3: path.resolve(__dirname, '../../node_modules/web3/dist/web3.min.js') },
    },
    server: {
        proxy: {
            '/rpcshuttleflow': ProxyConfig,
            '/rpcsponsor': ProxyConfig,
        },
    },
});
