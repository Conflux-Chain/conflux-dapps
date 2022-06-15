import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    base: './',
    resolve: {
        alias: { web3: path.resolve(__dirname, '../../node_modules/web3/dist/web3.min.js') },
    },
});
