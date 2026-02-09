import MSNIcon from 'airdrop/src/assets/MSN.png';
import PPIIcon from 'airdrop/src/assets/PPI.png';
import PHXIcon from 'airdrop/src/assets/PHX.jpeg';

const config = {
    '1029': [
        {
            eSpace_address: '0xf24b060bdf1cc97ce104971553fb81a186e79ee6',
            name: 'Meson Token',
            symbol: 'MSN',
            decimals: 4,
            icon: MSNIcon,
        },
        {
            eSpace_address: '0x22f41abf77905f50df398f21213290597e7414dd',
            name: 'Swappi Token',
            symbol: 'PPI',
            decimals: 18,
            icon: PPIIcon,
        },
        {
            eSpace_address: '0x13db4686f3D1D9ec918A70AE8fbd52f82949906C',
            name: 'PHX Token',
            symbol: 'PHX',
            decimals: 18,
            icon: PHXIcon,
        }
    ],
    '1': [
        {
            eSpace_address: '0xc229b45761C0F960A8d6cD4f770E7065528d150A',
            name: 'Conflux Faucet Token',
            symbol: 'CFT',
            decimals: 18,
            icon: 'https://conflux-static.oss-cn-beijing.aliyuncs.com/icons/default.png',
        },
        {
            eSpace_address: '0x2eeb7e2B0248AC9B3bFF5F3A1aA3Ad06eF7e675D',
            name: 'conflux USDT',
            symbol: 'cUSDT',
            decimals: 18,
            icon: 'https://conflux-static.oss-cn-beijing.aliyuncs.com/icons/default.png',
        },
        {
            eSpace_address: '0x26AEe1DEe904c9D20bF6828950633174223D5216',
            name: 'conflux ETH',
            symbol: 'cETH',
            decimals: 18,
            icon: 'https://conflux-static.oss-cn-beijing.aliyuncs.com/icons/default.png',
        },
        {
            eSpace_address: '0xda49fdf62164fc7a4e3ce786c984bf76cb4f4498',
            name: 'Evm Faucet Token',
            symbol: 'EFT',
            decimals: 18,
            icon: 'https://conflux-static.oss-cn-beijing.aliyuncs.com/icons/default.png',
        },
    ],
};

export default config;
