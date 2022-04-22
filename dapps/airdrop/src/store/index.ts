import { createBalanceTracker } from '@cfxjs/use-wallet-enhance';
import networkConfig from 'cross-space/network-config.json';
import { Conflux, format, address } from 'js-conflux-sdk';
import { CrossSpaceCall } from 'js-conflux-sdk/src/contract/internal/index.js';
import tokenListConfig from '../../tokenListConfig';
import CRC20TokenABI from 'cross-space/src/contracts/abi/ERC20.json';

export interface Token {
    core_address: string;
    eSpace_address: string;
    name: string;
    symbol: string;
    decimals: string;
    icon: string;
}

const isProduction = !location.host.startsWith('test') && !location.host.startsWith('localhost');
export const tokenList = tokenListConfig[isProduction ? '1029' : '1'];
export const currentNetwork = networkConfig[isProduction ? '1029' : '1'];

interface CrossSpaceContract { 
    callEVM(to: string, data: string): Record<string, string>;
    transferEVM(eSpaceAccount: string): Record<string, string>;
    withdrawFromMapped(eSpaceMirrorAddress: string): Record<string, string>;
};
interface TokenContract {
    transfer(to: string, amount: string): Record<string, string>;
}
export const conflux = new Conflux({} as any);
export const crossSpaceContract = conflux.Contract(CrossSpaceCall) as unknown as CrossSpaceContract;
export const crossSpaceContractAddress = format.address(CrossSpaceCall.address, +currentNetwork.networkId);
export const tokenContract = conflux.Contract({ abi: CRC20TokenABI }) as unknown as TokenContract;

const [tokenBalanceStore, startTrack] = createBalanceTracker(
    tokenList.map((token) => ({
        fetcher: ({ wallet: { account } }) =>
            account &&
            fetch(currentNetwork.eSpace.url, {
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_call',
                    params: [
                        {
                            data: '0x70a08231000000000000000000000000' + (address as any).cfxMappedEVMSpaceAddress(account).slice(2),
                            to: token.eSpace_address,
                        },
                        'latest',
                    ],
                    id: 1,
                }),
                headers: { 'content-type': 'application/json' },
                method: 'POST',
            })
                .then((response) => response.json())
                .then((balanceRes: Record<string, string>) => balanceRes?.result),
    }))
);

export { startTrack };

export const useTokenList = () => {
    const balanceList = tokenBalanceStore.map(({ use }) => use());

    return tokenList.map((token, index) => ({
        ...token,
        balance: balanceList[index],
        trackChangeOnce: tokenBalanceStore[index].trackChangeOnce,
    }));
};
