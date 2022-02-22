const path = require('path');

module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
        path.resolve(__dirname, '../../packages/common/components/**/*.{js,ts,jsx,tsx}'),
        path.resolve(__dirname, '../../packages/common/modules/**/*.{js,ts,jsx,tsx}'),
    ],
};
