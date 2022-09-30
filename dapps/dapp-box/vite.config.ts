import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const TestServerUrl = 'https://test.confluxhub.io';
const ProxyConfig = {
    target: TestServerUrl,
    changeOrigin: true,
};

export default defineConfig({
    plugins: [react()],
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
