const path = require('path');

module.exports = {
    content: [
        path.resolve(__dirname, '../../dapps/*/src/**/*.{js,ts,jsx,tsx}'),
        path.resolve(__dirname, '../../packages/common/components/**/*.{js,ts,jsx,tsx}'),
        path.resolve(__dirname, '../../packages/common/modules/**/*.{js,ts,jsx,tsx}'),
        path.resolve(__dirname, '../../packages/common/dev/**/*.{js,ts,jsx,tsx}'),
    ],
};
