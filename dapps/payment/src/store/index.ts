import { store } from '@cfxjs/use-wallet-react/ethereum';
import { createBalanceTracker } from '@cfxjs/use-wallet-enhance-react';
import CRC20TokenABI from 'common/contracts/ERC20.json';
import createContract from 'common/utils/Contract';
import { isProduction } from 'common/conf/Networks';
import Networks from 'common/conf/Networks';
import { validateHexAddress } from 'common/utils/addressUtils';
import tokenListConfig from '../utils/tokens';

export interface Token {
    eSpace_address: string;
    name: string;
    symbol: string;
    decimals: number;
    icon: string;
}

export const tokenList = tokenListConfig[isProduction ? '1030' : '71'];

interface TokenContract {
    transfer(to: string, amount: string): { encodeABI: () => string };
}
export const tokenContract = createContract<TokenContract>(CRC20TokenABI);

const [tokenBalanceStore, startTrack] = createBalanceTracker({
    subObjects: tokenList.map((token) => ({
        fetcher: ({ wallet: { account } }) => {
            return (
                account &&
                validateHexAddress(account) &&
                fetch(Networks.eSpace.rpcUrls[0], {
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        method: 'eth_call',
                        params: [
                            {
                                data: '0x70a08231000000000000000000000000' + account.slice(2),
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
