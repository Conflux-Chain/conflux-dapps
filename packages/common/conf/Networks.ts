export interface Network {
    chainId: string;
    chainName: string;
    rpcUrls: [string, ...string[]];
    blockExplorerUrls: [string, ...string[]];
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
}

export const isProduction =
    !location.host.startsWith('net8888') &&
    !location.host.startsWith('test') &&
    !location.host.startsWith('localhost') &&
    !location.host.startsWith('172.16') &&
    !location.host.startsWith('127.0') &&
    !location.host.startsWith('192.168') &&
    !location.host.startsWith('dev-internal');

export const spaceSeat = (chainId?: string | undefined): 'core' | 'eSpace' | '' => {
    const chainIdToSpace: Record<string, 'core' | 'eSpace'> = {
        '1029': 'core',
        '1': 'core',
        '8888': 'core',
        '1030': 'eSpace',
        '71': 'eSpace',
        '8889': 'eSpace',
        '9007199254740991': 'eSpace',
    };

    return chainId && chainIdToSpace[chainId] || '';
};

export const spaceRpcurl = (chainId?: string | undefined): string => {
    return spaceSeat(chainId) === 'eSpace' ? Networks.eSpace.rpcUrls[0] : Networks.core.rpcUrls[0];
}

export const isStage = location.host.startsWith('stage');

const AllNetworks: Record<string, Network> = {
    '1029': {
        chainId: '1029',
        chainName: 'Conflux Hydra',
        rpcUrls: ['https://main.confluxrpc.com'],
        blockExplorerUrls: ['https://confluxscan.org'],
        nativeCurrency: {
            name: 'Conflux',
            symbol: 'CFX',
            decimals: 18,
        },
    },
    '1030': {
        chainId: '1030',
        chainName: 'Conflux eSpace',
        rpcUrls: ['https://evm.confluxrpc.com'],
        blockExplorerUrls: ['https://evm.confluxscan.org'],
        nativeCurrency: {
            name: 'Conflux',
            symbol: 'CFX',
            decimals: 18,
        },
    },
    '1': {
        chainId: '1',
        chainName: 'Conflux Testnet',
        rpcUrls: ['https://test.confluxrpc.com'],
        blockExplorerUrls: ['https://testnet.confluxscan.org'],
        nativeCurrency: {
            name: 'Conflux',
            symbol: 'CFX',
            decimals: 18,
        },
    },
    '71': {
        chainId: '71',
        chainName: 'Conflux eSpace (Testnet)',
        rpcUrls: ['https://evmtestnet.confluxrpc.com'],
        blockExplorerUrls: ['https://evmtestnet.confluxscan.org'],
        nativeCurrency: {
            name: 'Conflux',
            symbol: 'CFX',
            decimals: 18,
        },
    },
    '56': {
        chainId: '56',
        chainName: 'Binance Smart Chain',
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com'],
        nativeCurrency: {
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18,
        },
    },
    '97': {
        chainId: '97',
        chainName: 'BSC (Testnet)',
        rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
        blockExplorerUrls: ['https://testnet.bscscan.com'],
        nativeCurrency: {
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18,
        },
    },
    '8888': {
        chainId: '8888',
        chainName: 'Conflux 8888',
        rpcUrls: ['https://net8888cfx.confluxrpc.com'],
        blockExplorerUrls: ['https://net8888cfx.confluxscan.org'],
        nativeCurrency: {
            name: 'Conflux',
            symbol: 'CFX',
            decimals: 18,
        },
    },
    '8889': {
        chainId: '8889',
        chainName: 'Conflux 8889',
        rpcUrls: ['https://net8889eth.confluxrpc.com'],
        blockExplorerUrls: ['https://net8889eth.confluxscan.org'],
        nativeCurrency: {
            name: 'Conflux',
            symbol: 'CFX',
            decimals: 18,
        },
    },
    '63': {
        chainId: '63',
        chainName: 'ETC Mordor',
        rpcUrls: ['https://www.ethercluster.com/mordor'],
        blockExplorerUrls: ['https://blockexplorer.one/ethereum-classic/mordor'],
        nativeCurrency: {
            name: 'Ethereum Classic',
            symbol: 'ETC',
            decimals: 18,
        },
    },
};

export const isTestCoreChainId = location.host.startsWith('net8888') ? '8888' : location.host.startsWith('test') ? '1' : import.meta.env.VITE_LOCAL_CORE_NETWORK;
export const isTestEvmChainId = location.host.startsWith('net8888') ? '8889' : location.host.startsWith('test') ? '71' : import.meta.env.VITE_LOCAL_EVM_NETWORK; // 8889 Tested under 8888 domin name

const Networks = {
    core: AllNetworks[isProduction ? '1029' : isTestCoreChainId],
    eSpace: AllNetworks[isProduction ? '1030' : isTestEvmChainId],
    bsc: AllNetworks[isProduction ? '56' : '97'],
    etc: AllNetworks[isProduction ? '63' : '63'],
} as const;

export default Networks;
