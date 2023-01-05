import create from 'zustand';

import { store, useBalance } from '@cfxjs/use-wallet-react/ethereum';
import { createBalanceTracker } from '@cfxjs/use-wallet-enhance-react';
import CRC20TokenABI from 'common/contracts/ERC20.json';
import createContract from 'common/utils/Contract';
import { isProduction } from 'common/conf/Networks';
import Networks from 'common/conf/Networks';
import { validateHexAddress } from 'common/utils/addressUtils';
import tokenListConfig from '../utils/tokens';
import { getAPPs, getAPPCards, getAPPAPIs, getPaidAPPs, getAPPRefundStatus } from 'payment/src/utils/request';
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
    const CFXBalance = useBalance();

    return [
        {
            eSpace_address: '',
            balance: CFXBalance,
            decimals: 18,
            icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMzNweCIgaGVpZ2h0PSIzM3B4IiB2aWV3Qm94PSIwIDAgMzMgMzMiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDYxLjIgKDg5NjUzKSAtIGh0dHBzOi8vc2tldGNoLmNvbSAtLT4KICAgIDx0aXRsZT5Ub2tlbnM8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZyBpZD0i6aG16Z2iLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSLnlLvmnb8iIHRyYW5zZm9ybT0idHJhbnNsYXRlKC00NzUuMDAwMDAwLCAtMzEuMDAwMDAwKSI+CiAgICAgICAgICAgIDxnIGlkPSJUb2tlbnMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQ2My4wMDAwMDAsIDE4LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPGcgaWQ9Ik1haW4iIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyLjAwMDAwMCwgMTMuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTE0LjA5Mzc5NDEsOS42MTI5NjI4NiBDMTMuODI1MTcwNSw5LjIzMjgzNDcgMTMuMzU0NjM0MSw5LjAwMTM2MzM1IDEyLjg0Nzc5NjcsOSBMNC4xNTUyOTU4Niw5IEMzLjY0NTgzNTIxLDguOTk5MTE2MzYgMy4xNzE5MzgxMiw5LjIzMDg3MDA1IDIuOTAxOTI0ODUsOS42MTI5NjI4NyBMMC4yMjU2MTM1MjcsMTMuNDAxNDg4OCBDLTAuMTE4NTc4MzcxLDEzLjg4NjUyMzggLTAuMDY0NzQ2MDY4OCwxNC41MTMzOTYyIDAuMzU4MzIzMzY0LDE0Ljk0Njg4NyBMNy45Mzc1MjYzNCwyMi43NzE3MTM4IEM4LjIwMjE2NjI4LDIzLjA0NTQxMDcgOC42Njc1Njc0MywyMy4wNzc1NDY0IDguOTc3MDMwNTIsMjIuODQzNDkxNiBDOS4wMDYxNTA3MywyMi44MjE0NjcyIDkuMDMzMjg1MzEsMjIuNzk3NDY4NiA5LjA1ODE4NzY5LDIyLjc3MTcxMzggTDE2LjYzNzM5MDcsMTQuOTQ2ODg3IEMxNy4wNjI4MDQxLDE0LjUxNDg3ODIgMTcuMTE5NjMzNywxMy44ODc5MTQzIDE2Ljc3NzQ3MzIsMTMuNDAxNDg4OCBMMTQuMDkzNzk0MSw5LjYxMjk2Mjg2IFoiIGlkPSLot6/lvoQiIGZpbGw9IiNDNEM2RDIiIGZpbGwtcnVsZT0ibm9uemVybyI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yNi43Nzc2MDcyLDE4LjQ2NTY5MjYgQzI2LjU3MjE4OTIsMTguMTc2ODkzOSAyNi4yMTIzNjczLDE4LjAwMTAzNTggMjUuODI0Nzg1NywxOCBMMTkuMTc3NTc5MiwxOCBDMTguNzg3OTkxNiwxNy45OTkzMjg3IDE4LjQyNTU5OTcsMTguMTc1NDAxMyAxOC4yMTkxMTksMTguNDY1NjkyNiBMMTYuMTcyNTI4LDIxLjM0Mzk4ODIgQzE1LjkwOTMyMjQsMjEuNzEyNDg4OSAxNS45NTA0ODgzLDIyLjE4ODc0OSAxNi4yNzQwMTIsMjIuNTE4MDg5NCBMMjIuMDY5ODczMSwyOC40NjI5MjU0IEMyMi4yNzIyNDQ4LDI4LjY3MDg2NCAyMi42MjgxMzk4LDI4LjY5NTI3ODcgMjIuODY0Nzg4LDI4LjUxNzQ1NzkgQzIyLjg4NzA1NjQsMjguNTAwNzI1MSAyMi45MDc4MDY0LDI4LjQ4MjQ5MjQgMjIuOTI2ODQ5NCwyOC40NjI5MjU0IEwyOC43MjI3MTA1LDIyLjUxODA4OTQgQzI5LjA0ODAyNjYsMjIuMTg5ODc1IDI5LjA5MTQ4NDYsMjEuNzEzNTQ1MiAyOC44Mjk4MzI1LDIxLjM0Mzk4ODIgTDI2Ljc3NzYwNzIsMTguNDY1NjkyNiBaIiBpZD0i6Lev5b6EIiBmaWxsPSIjN0Y4Mjk2IiBmaWxsLXJ1bGU9Im5vbnplcm8iPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMjUuNTgwOTM0MiwzLjc0NDMxMjcyIEMyNS4yNjQ5MDY1LDMuMjgyNzI4MTEgMjQuNzExMzM0MywzLjAwMTY1NTQ5IDI0LjExNTA1NSwzIEwxMy44ODg1ODM0LDMgQzEzLjI4OTIxNzksMi45OTg5MjcwMSAxMi43MzE2OTE5LDMuMjgwMzQyNDYgMTIuNDE0MDI5MiwzLjc0NDMxMjc0IEw5LjI2NTQyNzY4LDguMzQ0NjY5ODMgQzguODYwNDk2MDMsOC45MzM2NDE0OSA4LjkyMzgyODE1LDkuNjk0ODQ0MzMgOS40MjE1NTY5LDEwLjIyMTIyNjUgTDE4LjMzODI2NjMsMTkuNzIyODEwNiBDMTguNjQ5NjA3NCwyMC4wNTUxNTcxIDE5LjE5NzEzODIsMjAuMDk0MTc5MSAxOS41NjEyMTI0LDE5LjgwOTk2OTUgQzE5LjU5NTQ3MTQsMTkuNzgzMjI1NSAxOS42MjczOTQ1LDE5Ljc1NDA4NDMgMTkuNjU2NjkxNCwxOS43MjI4MTA2IEwyOC41NzM0MDA4LDEwLjIyMTIyNjUgQzI5LjA3Mzg4NzEsOS42OTY2NDM5NSAyOS4xNDA3NDU2LDguOTM1MzI5ODggMjguNzM4MjAzOCw4LjM0NDY2OTgyIEwyNS41ODA5MzQyLDMuNzQ0MzEyNzIgWiIgaWQ9Iui3r+W+hCIgZmlsbD0iIzRDNEY2MCIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPGcgaWQ9InNwYXJrIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyLjAwMDAwMCwgMTAuMDAwMDAwKSIgZmlsbD0iI0ZGRkZGRiI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxyZWN0IGlkPSLnn6nlvaIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE0LjAwMDAwMCwgNC42MDAwMDApIHJvdGF0ZSg0Ny4wMDAwMDApIHRyYW5zbGF0ZSgtMTQuMDAwMDAwLCAtNC42MDAwMDApICIgeD0iMTAiIHk9IjQiIHdpZHRoPSI4IiBoZWlnaHQ9IjEuMiIgcng9IjAuNiI+PC9yZWN0PgogICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCBpZD0i55+p5b2i5aSH5Lu9IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0LjAwMDAwMCwgOC42MDAwMDApIHJvdGF0ZSg0Ny4wMDAwMDApIHRyYW5zbGF0ZSgtNC4wMDAwMDAsIC04LjYwMDAwMCkgIiB4PSIwLjUiIHk9IjgiIHdpZHRoPSI3IiBoZWlnaHQ9IjEuMiIgcng9IjAuNiI+PC9yZWN0PgogICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCBpZD0i55+p5b2i5aSH5Lu9LTIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE5LjI1MDAwMCwgMTUuNjAwMDAwKSByb3RhdGUoNDcuMDAwMDAwKSB0cmFuc2xhdGUoLTE5LjI1MDAwMCwgLTE1LjYwMDAwMCkgIiB4PSIxNyIgeT0iMTUiIHdpZHRoPSI0LjUiIGhlaWdodD0iMS4yIiByeD0iMC42Ij48L3JlY3Q+CiAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9IuakreWchuW9oiIgY3g9IjEwIiBjeT0iMC41IiByPSIxIj48L2NpcmNsZT4KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0i5qSt5ZyG5b2i5aSH5Lu9LTMiIGN4PSIwLjUiIGN5PSI1IiByPSIxIj48L2NpcmNsZT4KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0i5qSt5ZyG5b2i5aSH5Lu9LTQiIGN4PSIxNi41IiBjeT0iMTIuNSIgcj0iMSI+PC9jaXJjbGU+CiAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=',
            name: 'CFX',
            symbol: 'CFX',
            trackChangeOnce() {},
        },
    ].concat(
        // @ts-ignore
        tokenList.map((token, index) => ({
            ...token,
            balance: balanceList[index],
            trackChangeOnce: tokenBalanceStore[index].trackChangeOnce,
        }))
    );
};

export const useBoundProviderStore = create(
    immer((set) => ({
        provider: {
            loading: false,
            error: null,
            data: {
                list: [],
                total: 0,
            },
            fetch: async (owner: string) => {
                if (owner) {
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
                } else {
                    set((state) => {
                        state.provider.data.list = [];
                        state.provider.data.total = 0;
                    });
                }
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
                if (account) {
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
                } else {
                    set((state) => {
                        state.consumerPaidAPPs.data = {
                            list: [],
                            total: 0,
                        };
                    });
                }
            },
        },
        APPRefundStatus: {
            loading: false,
            error: null,
            data: {
                deferTimeSecs: '0',
                withdrawSchedules: '0',
            },
            fetch: async (appAddr: string, account: string) => {
                if (account) {
                    set((state) => {
                        state.APPRefundStatus.loading = true;
                    });
                    const data = await getAPPRefundStatus(appAddr, account);
                    set((state) => {
                        state.APPRefundStatus.data = data;
                    });
                    set((state) => {
                        state.APPRefundStatus.loading = false;
                    });
                } else {
                    set((state) => {
                        state.APPRefundStatus.data = {
                            deferTimeSecs: '0',
                            withdrawSchedules: '0',
                        };
                    });
                }
            },
        },
    }))
);
