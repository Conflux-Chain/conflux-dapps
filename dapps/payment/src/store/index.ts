import create from 'zustand';

import { store } from '@cfxjs/use-wallet-react/ethereum';
import { createBalanceTracker } from '@cfxjs/use-wallet-enhance-react';
import CRC20TokenABI from 'common/contracts/ERC20.json';
import createContract from 'common/utils/Contract';
import { isProduction } from 'common/conf/Networks';
import Networks from 'common/conf/Networks';
import { validateHexAddress } from 'common/utils/addressUtils';
import tokenListConfig from '../utils/tokens';
import { getAPPs, getAPPCards, getAPPAPIs, getPaidAPPs } from 'payment/src/utils/request';
import { immer } from 'zustand/middleware/immer';

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

export const useBoundProviderStore = create(
    immer((set, get) => ({
        provider: {
            loading: false,
            error: null,
            data: {
                list: [],
                total: 0,
            },
            fetch: async (owner: string) => {
                set((state) => {
                    state.provider.loading = true;
                });
                const data = await getAPPs(owner);
                set((state) => {
                    state.provider.data.list = data;
                    state.provider.data.total = data.length;
                });
                set((state) => {
                    state.provider.loading = false;
                });
            },
        },
        subscription: {
            loading: false,
            error: null,
            data: {
                list: [],
                total: 0,
            },
            fetch: async (owner: string) => {
                set((state) => {
                    state.subscription.loading = true;
                });
                const data = await getAPPCards(owner);
                set((state) => {
                    state.subscription.data = data;
                });
                set((state) => {
                    state.subscription.loading = false;
                });
            },
        },
        billing: {
            loading: false,
            error: null,
            data: {
                list: [],
                total: 0,
            },
            fetch: async (owner: string) => {
                set((state) => {
                    state.billing.loading = true;
                });
                const data = await getAPPAPIs(owner);
                set((state) => {
                    state.billing.data = data;
                });
                set((state) => {
                    state.billing.loading = false;
                });
            },
        },
        consumerAPPs: {
            loading: false,
            error: null,
            data: {
                list: [],
                total: 0,
            },
            fetch: async () => {
                set((state) => {
                    state.consumerAPPs.loading = true;
                });
                const data = await getAPPs();
                set((state) => {
                    state.consumerAPPs.data.list = data;
                    state.consumerAPPs.data.total = data.length;
                });
                set((state) => {
                    state.consumerAPPs.loading = false;
                });
            },
        },
        consumerPaidAPPs: {
            loading: false,
            error: null,
            data: {
                list: [],
                total: 0,
            },
            fetch: async (account: string) => {
                set((state) => {
                    state.consumerPaidAPPs.loading = true;
                });
                const data = await getPaidAPPs(account);
                set((state) => {
                    state.consumerPaidAPPs.data = data;
                });
                set((state) => {
                    state.consumerPaidAPPs.loading = false;
                });
            },
        },
    }))
);
