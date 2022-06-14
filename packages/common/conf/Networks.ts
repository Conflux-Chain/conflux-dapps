export interface Network {
    chainId: string;
    chainName: string;
    rpcUrls: [string, ...string[]];
    blockExplorerUrls: [string, ...string[]];
    nativeCurrency: {
        name:  string;
        symbol: string;
        decimals: number;
    },
}

export const isProduction = !location.host.startsWith('test') && !location.host.startsWith('localhost');

const AllNetworks: Record<string, Network> = {
    "1029": {
        chainId: "1029",
        chainName: "Conflux Hydra",
        rpcUrls: ["https://evm.confluxrpc.com"],
        blockExplorerUrls: ["https://evm.confluxscan.net"],
        nativeCurrency: {
            name: 'Conflux',
            symbol: 'CFX',
            decimals: 18,
        }
    },
    "1030": {
        chainId: "1030",
        chainName: "Conflux eSpace",
        rpcUrls: ["https://evm.confluxrpc.com"],
        blockExplorerUrls: ["https://evm.confluxscan.net"],
        nativeCurrency: {
            name: 'Conflux',
            symbol: 'CFX',
            decimals: 18,
        }
    },
    "1": {
        chainId: "1",
        chainName: "Conflux Testnet",
        rpcUrls: ["https://test.confluxrpc.com"],
        blockExplorerUrls: ["https://testnet.confluxscan.net"],
        nativeCurrency: {
            name: 'Conflux',
            symbol: 'CFX',
            decimals: 18,
        }
    },
    "71": {
        chainId: "71",
        chainName: "Conflux eSpace (Testnet)",
        rpcUrls: ["https://evmtestnet.confluxrpc.com"],
        blockExplorerUrls: ["https://evmtestnet.confluxscan.net"],
        nativeCurrency: {
            name: 'Conflux',
            symbol: 'CFX',
            decimals: 18,
        }
    },
    "56": {
        chainId: "56",
        chainName: "Binance Smart Chain",
        rpcUrls: ["https://bsc-dataseed.binance.org/"],
        blockExplorerUrls: ["https://bscscan.com"],
        nativeCurrency: {
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18,
        }
    },
    "97": {
        chainId: "97",
        chainName: "BSC (Testnet)",
        rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
        blockExplorerUrls: ["https://testnet.bscscan.com"],
        nativeCurrency: {
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18,
        }
    }
};


const Networks = {
    core: AllNetworks[isProduction ? '1029' : '1'],
    eSpace: AllNetworks[isProduction ? '1030' : '71'],
    bsc: AllNetworks[isProduction ? '56' : '97'],
} as const;

export default Networks;