import { store } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { createBalanceTracker } from '@cfxjs/use-wallet-enhance-react';
import CRC20TokenABI from 'common/contracts/ERC20.json';
import CrossSpaceContract from 'common/contracts/CrossSpace.json';
import createContract from 'common/utils/Contract';
import { isProduction } from 'common/conf/Networks';
import Networks from 'common/conf/Networks';
import { convertHexToCfx, cfxMappedEVMSpaceAddress, validateCfxAddress } from 'common/utils/addressUtils';
import tokenListConfig from '../../tokenListConfig';

export interface Token {
    eSpace_address: string;
    name: string;
    symbol: string;
    decimals: number;
    icon: string;
}

export const tokenList = tokenListConfig[isProduction ? '1029' : '1'];

interface CrossSpaceContract {
    callEVM(to: string, data: string): { encodeABI: () => string };
    transferEVM(eSpaceAccount: string): { encodeABI: () => string };
    withdrawFromMapped(eSpaceMirrorAddress: string): { encodeABI: () => string };
}
interface TokenContract {
    transfer(to: string, amount: string): { encodeABI: () => string };
}
export const crossSpaceContract = createContract<CrossSpaceContract>(CrossSpaceContract.abi);
export const crossSpaceContractAddress = convertHexToCfx(CrossSpaceContract.address, +Networks.core.chainId);
export const tokenContract = createContract<TokenContract>(CRC20TokenABI);

const [tokenBalanceStore, startTrack] = createBalanceTracker({
    subObjects: tokenList.map((token) => ({
        fetcher: ({ wallet: { account } }) => {
            return (
                account &&
                validateCfxAddress(account) &&
                fetch(Networks.eSpace.rpcUrls[0], {
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        method: 'eth_call',
                        params: [
                            {
                                data: '0x70a08231000000000000000000000000' + cfxMappedEVMSpaceAddress(account).slice(2),
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
                    .then((balanceRes: Record<string, string>) => balanceRes?.result)
            );
        },
    })),
    store,
});
export { startTrack };

export const useTokenList = () => {
    const balanceList = tokenBalanceStore.map(({ use }) => use());

    return tokenList.map((token, index) => ({
        ...token,
        balance: balanceList[index],
        trackChangeOnce: tokenBalanceStore[index].trackChangeOnce,
    }));
};
