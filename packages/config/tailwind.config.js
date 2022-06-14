const path = require('path');

module.exports = {
    content: [
        path.resolve(__dirname, '../../dapps/cross-space/src/**/*.{js,ts,jsx,tsx}'),
        path.resolve(__dirname, '../../dapps/hub/src/**/*.{js,ts,jsx,tsx}'),
        path.resolve(__dirname, '../../dapps/bsc-espace/src/**/*.{js,ts,jsx,tsx}'),
        path.resolve(__dirname, '../../dapps/airdrop/src/**/*.{js,ts,jsx,tsx}'),
        path.resolve(__dirname, '../../packages/common/components/**/*.{js,ts,jsx,tsx}'),
        path.resolve(__dirname, '../../packages/common/modules/**/*.{js,ts,jsx,tsx}'),
        path.resolve(__dirname, '../../packages/common/dev/**/*.{js,ts,jsx,tsx}'),
    ],
};
