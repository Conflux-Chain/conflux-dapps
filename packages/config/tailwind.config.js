const path = require('path');

module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
        path.resolve(__dirname, '../../packages/ui/components/**/*.{js,ts,jsx,tsx}'),
        path.resolve(__dirname, '../../packages/ui/modules/**/*.{js,ts,jsx,tsx}'),
    ],
};
