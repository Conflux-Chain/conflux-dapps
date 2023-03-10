import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as walletStore, provider, Unit } from '@cfxjs/use-wallet-react/ethereum';
import { networkStore, useCurrentFromChain, Contracts } from './index';
import Config from 'bsc-espace/config';
import { tokenStore, type Token } from './token';
import { type ValueOf } from 'tsconfig/types/enhance';

interface BalanceStore {
    balance?: Unit;
    maxAvailableBalance?: Unit;
    transferBalance?: Unit;
    approvedBalance?: Unit;
    reCheckApproveCount?: number;
}

interface PeggedAndLiquidityStore {
    eSpacePeggedBalance?: Unit;
    eSpaceMaximumLiquidity?: Unit;
    crossChainPeggedBalance?: Unit;
    crossChainMaximumLiquidity?: Unit;
}

export const balanceStore = create(
    subscribeWithSelector(
        () =>
            ({
                balance: undefined,
                maxAvailableBalance: undefined,
                transferBalance: undefined,
                peggedBalance: undefined,
                maximumLiquidity: undefined,
                approvedBalance: undefined,
                reCheckApproveCount: 0,
            } as BalanceStore)
    )
);

export const peggedAndLiquidityStore = create(
    subscribeWithSelector(
        () =>
            ({
                eSpacePeggedBalance: undefined,
                eSpaceMaximumLiquidity: undefined,
                crossChainPeggedBalance: undefined,
                crossChainMaximumLiquidity: undefined
            } as PeggedAndLiquidityStore)
    )
);

export const startSubPeggedAndLiquidity = () => {
    const unSubExec: Function[] = [];
    let balanceTick = 0;
    const getAccount = () => walletStore.getState().accounts?.[0];

    // same balance should not reset obj state causes duplicate render.
    const handleBalanceChanged = (newBalance: Unit, type: keyof PeggedAndLiquidityStore, currentBalanceTick: number) => {
        if (!newBalance || currentBalanceTick !== balanceTick - 1) return;
        const preBalance = peggedAndLiquidityStore.getState()[type]
        if (preBalance === undefined || !preBalance.equalsWith(newBalance)) {
            peggedAndLiquidityStore.setState({ [type]: newBalance });
        }
    };

    const getBalance = (callback?: () => void) => {
        const account = getAccount();
        if (!account) return;

        const currentBalanceTick = balanceTick;
        balanceTick += 1;
        const { eSpaceBridgeContractAddress, crossChainBridgeContractAddress } = Contracts;
        const { eSpace: eSpaceNetwork, crossChain: crossChianNetwork } = networkStore.getState();
        if (!eSpaceBridgeContractAddress || !crossChainBridgeContractAddress || !eSpaceNetwork || !crossChianNetwork) return;
        // get eSpace maximumLiquidity value.
        fetch(eSpaceNetwork.network.rpcUrls[0], {
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getBalance',
                params: [eSpaceBridgeContractAddress, 'latest'],
                id: 1,
            }),
            headers: {'content-type': 'application/json'},
            method: 'POST',
        })
            .then(response => response.json()).then((balanceRes: Record<string, string>) => {
                const minUnitBalance = balanceRes?.result;
                if (typeof minUnitBalance === 'string') {
                    handleBalanceChanged(Unit.fromMinUnit(minUnitBalance), 'eSpaceMaximumLiquidity', currentBalanceTick);
                } else {
                    // console.error(`get eSpace maximumLiquidity error: `, balanceRes);
                }
            })
            .catch(err => {})
            .finally(callback);

        // get crossChain maximumLiquidity value.
        fetch(crossChianNetwork.network.rpcUrls[0], {
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [{
                    data: '0x70a08231000000000000000000000000' + crossChainBridgeContractAddress.slice(2),
                    to: Config.chains[0].tokens[0].address,
                }, 'latest'],
                id: 1,
            }),
            headers: {'content-type': 'application/json'},
            method: 'POST',
        })
            .then(response => response.json()).then((balanceRes: Record<string, string>) => {
                const minUnitBalance = balanceRes?.result;
                if (typeof minUnitBalance === 'string') {
                    handleBalanceChanged(Unit.fromMinUnit(minUnitBalance), 'crossChainMaximumLiquidity', currentBalanceTick);
                } else {
                    // console.error(`get eSpace maximumLiquidity error: `, balanceRes);
                }
            })
            .catch(err => {})
            .finally(callback);

        // get PeggedToken Balance
        (['eSpace', 'crossChain'] as const).forEach((type) => {
            fetch((type === 'eSpace' ? eSpaceNetwork : crossChianNetwork).network.rpcUrls[0], {
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_call',
                    params: [{
                        data: '0x70a08231000000000000000000000000' + account.slice(2),
                        to: type === 'eSpace' ? Config.tokens[0].PeggedToken.address : Config.chains[0].tokens[0].PeggedToken.address,
                    }, 'latest'],
                    id: 1,
                }),
                headers: {'content-type': 'application/json'},
                method: 'POST',
            })
                .then(response => response.json()).then((balanceRes: Record<string, string>) => {
                    const minUnitBalance = balanceRes?.result;
                    if (typeof minUnitBalance === 'string') {
                        handleBalanceChanged(Unit.fromMinUnit(minUnitBalance), (type + 'PeggedBalance') as 'eSpacePeggedBalance', currentBalanceTick);
                    } else {
                        // console.error(`get eSpace maximumLiquidity error: `, balanceRes);
                    }
                })
                .catch(err => {})
                .finally(callback);
        });
    };

    let balanceTimer: number | null = null;
    let setUndefinedTimer: number | null = null;
    const clearBalanceTimer = () => {
        if (balanceTimer !== null) {
            clearInterval(balanceTimer);
            balanceTimer = null;
        }
    };
    const clearUndefinedTimer = () => {
        if (setUndefinedTimer !== null) {
            clearTimeout(setUndefinedTimer);
            setUndefinedTimer = null;
        }
    };

    const trackBalance = async () => {
        const account = getAccount();
        if (!account) {
            clearBalanceTimer();
            clearUndefinedTimer();
            peggedAndLiquidityStore.setState({
                eSpacePeggedBalance: undefined,
                eSpaceMaximumLiquidity: undefined,
                crossChainPeggedBalance: undefined,
                crossChainMaximumLiquidity: undefined
            });
            return;
        }

        clearUndefinedTimer();

        // Prevent interface jitter from having a value to undefined to having a value again in a short time when switching tokens.
        // Shortly fail to get the value and then turn to undefined
        setUndefinedTimer = setTimeout(() => {
            peggedAndLiquidityStore.setState({
                eSpacePeggedBalance: undefined,
                eSpaceMaximumLiquidity: undefined,
                crossChainPeggedBalance: undefined,
                crossChainMaximumLiquidity: undefined
            });
            setUndefinedTimer = null;
        }, 50) as unknown as number;

        // Clear the setUndefinedTimer after first fetch balance, if this timer is not already in effect.
        setTimeout(() => getBalance(clearUndefinedTimer), 10);

        clearBalanceTimer();
        balanceTimer = setInterval(getBalance, 1500) as unknown as number;
    };

    unSubExec.push(
        walletStore.subscribe(
            (state) => state.accounts,
            () => {
                setTimeout(trackBalance, 10);
            },
            { fireImmediately: true }
        )
    );

    unSubExec.push(() => {
        clearBalanceTimer();
        clearUndefinedTimer();
    });

    return () => {
        unSubExec.forEach((unsub) => unsub());
    };
};

export const startSubBalance = () => {
    const unSubExec: Function[] = [];

    // track currentToken balance and approvedBalance
    (function () {
        let balanceTick = 0;
        if (!provider) return;

        const getAccount = () => walletStore.getState().accounts?.[0];

        // same balance should not reset obj state causes duplicate render.
        const handleBalanceChanged = (newBalance: Unit, type: 'balance' | 'approvedBalance', currentBalanceTick: number) => {
            const { chainId } = walletStore.getState();
            const { eSpace, crossChain, currentFrom } = networkStore.getState();
            if (!currentFrom || chainId !== (currentFrom === 'eSpace' ? eSpace.network.chainId : crossChain.network.chainId)) return;
            if (!newBalance || currentBalanceTick !== balanceTick - 1) return;
            const preBalance = balanceStore.getState()[type];
            if (preBalance === undefined || !preBalance.equalsWith(newBalance)) {
                if (type === 'approvedBalance') {
                    balanceStore.setState({ [type]: newBalance, reCheckApproveCount: 0 });
                } else {
                    balanceStore.setState({ [type]: newBalance });
                }
            } else {
                if (type !== 'approvedBalance') return;
                const { reCheckApproveCount } = balanceStore.getState();
                if (reCheckApproveCount! > 0) {
                    balanceStore.setState({ reCheckApproveCount: reCheckApproveCount! - 1 });
                }
            }
        };

        const getBalance = (callback?: () => void) => {
            const account = getAccount();
            const { token } = tokenStore.getState();
            const { currentFrom } = networkStore.getState();
            if (!account || !token) {
                return;
            }

            const currentBalanceTick = balanceTick;
            balanceTick += 1;

            // if From is eSpace, directly get balance from @cfxjs/use-wallet
            if (token.isNative) {
                handleBalanceChanged(walletStore.getState().balance!, 'balance', currentBalanceTick);
                callback?.();
                return;
            }

            // if token is CRC20, getBalance from eth_call
            const { tokenContract, eSpaceBridgeContractAddress, crossChainBridgeContractAddress } = Contracts;
            const currentFromBridgeContractAddress = currentFrom === 'eSpace' ? eSpaceBridgeContractAddress : crossChainBridgeContractAddress;
            if (!currentFromBridgeContractAddress) return;
            provider!
                .request({
                    method: `eth_call`,
                    params: [
                        {
                            data: '0x70a08231000000000000000000000000' + account.slice(2),
                            to: token.address,
                        },
                        'latest',
                    ],
                })
                .then((minUnitBalance) => handleBalanceChanged(Unit.fromMinUnit(minUnitBalance), 'balance', currentBalanceTick))
                .catch((err) => {})
                .finally(callback);

            // and at same time get approval value;
            if (!tokenContract) return;
            provider!
                .request({
                    method: 'eth_call',
                    params: [
                        {
                            data: tokenContract.allowance(account, currentFromBridgeContractAddress).encodeABI(),
                            to: token.address,
                        },
                        'latest',
                    ],
                })
                .then((approvalMinUnitBalance) => handleBalanceChanged(Unit.fromMinUnit(approvalMinUnitBalance), 'approvedBalance', currentBalanceTick))
                .catch((err) => {});
        };

        let balanceTimer: number | null = null;
        let setUndefinedTimer: number | null = null;
        const clearBalanceTimer = () => {
            if (balanceTimer !== null) {
                clearInterval(balanceTimer);
                balanceTimer = null;
            }
        };
        const clearUndefinedTimer = () => {
            if (setUndefinedTimer !== null) {
                clearTimeout(setUndefinedTimer);
                setUndefinedTimer = null;
            }
        };

        const trackBalance = async () => {
            const { chainId } = walletStore.getState();
            const { eSpace, crossChain, currentFrom } = networkStore.getState();
            const account = getAccount();

            if (!account || !currentFrom || chainId !== (currentFrom === 'eSpace' ? eSpace.network.chainId : crossChain.network.chainId)) {
                clearBalanceTimer();
                clearUndefinedTimer();
                balanceStore.setState({ balance: undefined, approvedBalance: undefined, transferBalance: undefined });
                return;
            }

            clearUndefinedTimer();

            // Prevent interface jitter from having a value to undefined to having a value again in a short time when switching tokens.
            // Shortly fail to get the value and then turn to undefined
            setUndefinedTimer = setTimeout(() => {
                balanceStore.setState({ balance: undefined, approvedBalance: undefined });
                setUndefinedTimer = null;
            }, 50) as unknown as number;

            // Clear the setUndefinedTimer after first fetch balance, if this timer is not already in effect.
            setTimeout(() => getBalance(clearUndefinedTimer), 10);

            clearBalanceTimer();
            balanceTimer = setInterval(getBalance, 1500) as unknown as number;
        };

        unSubExec.push(
            walletStore.subscribe(
                (state) => state.accounts,
                () => {
                    setTimeout(trackBalance, 10);
                },
                { fireImmediately: true }
            )
        );
        unSubExec.push(
            walletStore.subscribe(
                (state) => state.chainId,
                () => {
                    setTimeout(trackBalance, 10);
                },
                { fireImmediately: true }
            )
        );
        unSubExec.push(
            networkStore.subscribe(
                (state) => state.currentFrom,
                () => {
                    setTimeout(trackBalance, 10);
                },
                { fireImmediately: true }
            )
        );
        unSubExec.push(
            tokenStore.subscribe(
                (state) => state.token,
                () => {
                    setTimeout(trackBalance, 10);
                },
                { fireImmediately: true }
            )
        );

        unSubExec.push(() => {
            clearBalanceTimer();
            clearUndefinedTimer();
        });
    })();

    // trackMaxAvailableBalance
    (function () {
        let setUndefinedTimer: number | null = null;
        const clearUndefinedTimer = () => {
            if (setUndefinedTimer !== null) {
                clearTimeout(setUndefinedTimer);
                setUndefinedTimer = null;
            }
        };

        const trackBalance = () => {
            const account = walletStore.getState().accounts?.[0];
            const balance = balanceStore.getState().balance;
            const { bridgeContract, eSpaceBridgeContractAddress } = Contracts;
            const { chainId } = walletStore.getState();
            const { eSpace, crossChain, currentFrom } = networkStore.getState();
            const { token } = tokenStore.getState();

            if (!bridgeContract || !currentFrom || !balance || !account || chainId !== (currentFrom === 'eSpace' ? eSpace.network.chainId : crossChain.network.chainId)) {
                clearUndefinedTimer();
                balanceStore.setState({ maxAvailableBalance: undefined });
                return;
            }

            if (currentFrom === 'eSpace' && token.isNative) {
                // estimate MetaMask max available balance
                if (!provider) return;
                const minUnitBalance = Unit.lessThan(balance, Unit.fromStandardUnit('16e-12')) ? Unit.fromStandardUnit(0).toHexMinUnit() : Unit.sub(balance, Unit.fromStandardUnit('16e-12')).toHexMinUnit();
                Promise.all([
                    provider.request({
                        method: 'eth_estimateGas',
                        params: [
                            {
                                from: account,
                                data: bridgeContract.deposit(token.address, minUnitBalance, crossChain.network.chainId, account, `${parseInt(Date.now() / 1000 + '')}`).encodeABI(),
                                to: eSpaceBridgeContractAddress,
                                value: minUnitBalance
                            },
                        ],
                    }),
                    provider.request({
                        method: 'eth_gasPrice',
                        params: [],
                    }),
                ])
                    .then(([estimateGas, gasPrice]) => {
                        const gasFee = Unit.mul(Unit.mul(Unit.fromMinUnit(estimateGas), Unit.fromMinUnit(gasPrice)), Unit.fromMinUnit('1.5'));
                        balanceStore.setState({ maxAvailableBalance: Unit.greaterThan(balance, gasFee) ? Unit.sub(balance, gasFee) : Unit.fromMinUnit(0) });
                    })
                    .catch((err) => {
                        balanceStore.setState({ maxAvailableBalance: undefined });
                    })
                    .finally(clearUndefinedTimer);
            } else {
                balanceStore.setState({ maxAvailableBalance: balance });
            }
        };

        const unsub1 = balanceStore.subscribe(
            (state) => state.balance,
            () => {
                setTimeout(trackBalance, 10);
            },
            { fireImmediately: true }
        );
        const unsub2 = tokenStore.subscribe(
            (state) => state.token,
            () => {
                setTimeout(trackBalance, 10);
            },
            { fireImmediately: true }
        );
        unSubExec.push(unsub1, unsub2);
        unSubExec.push(() => {
            clearUndefinedTimer();
        });
    })();

    return () => {
        unSubExec.forEach((unsub) => unsub());
    };
};

const selectors = {
    balance: (state: BalanceStore) => state.balance,
    transferBalance: (state: BalanceStore) => state.transferBalance,
    maxAvailableBalance: (state: BalanceStore) => state.maxAvailableBalance,
    approvedBalance: (state: BalanceStore) => state.approvedBalance,
    reCheckApproveCount: (state: BalanceStore) => state.reCheckApproveCount,
    eSpaceMaximumLiquidity: (state: PeggedAndLiquidityStore) => state.eSpaceMaximumLiquidity,
    eSpacePeggedBalance: (state: PeggedAndLiquidityStore) => state.eSpacePeggedBalance,
    crossChainMaximumLiquidity: (state: PeggedAndLiquidityStore) => state.crossChainMaximumLiquidity,
    crossChainPeggedBalance: (state: PeggedAndLiquidityStore) => state.crossChainPeggedBalance,
} as const;

// track balance change once
const createTrackBalanceChangeOnce =
    ({ store, balanceSelector }: { store: typeof balanceStore | typeof peggedAndLiquidityStore, balanceSelector: ValueOf<typeof selectors> }) =>
    (callback: () => void) => {
        if (!callback) return;
        let unsubBalance: Function | null = null;
        let unsubAccount: Function | null = null;
        let unsubChainId: Function | null = null;
        const clearUnsub = () => {
            if (unsubBalance) {
                unsubBalance();
                unsubBalance = null;
            }
            if (unsubAccount) {
                unsubAccount();
                unsubAccount = null;
            }
            if (unsubChainId) {
                unsubChainId();
                unsubChainId = null;
            }
        }

        if (walletStore) {
            unsubAccount = walletStore.subscribe((state) => state.accounts, clearUnsub);
            if (store === balanceStore) {
                unsubChainId = walletStore.subscribe((state) => state.chainId, clearUnsub);
            }
        }

        unsubBalance = (store as typeof balanceStore).subscribe(balanceSelector as typeof selectors['balance'], () => {
            callback();
            clearUnsub();
        });
    };

const trackBalanceChangeOnce = {
    balance: createTrackBalanceChangeOnce({ store: balanceStore, balanceSelector: selectors.balance }),
    approvedBalance: createTrackBalanceChangeOnce({ store: balanceStore, balanceSelector: selectors.approvedBalance }),
    maxAvailableBalance: createTrackBalanceChangeOnce({ store: balanceStore,  balanceSelector: selectors.maxAvailableBalance }),
    eSpacePeggedBalance: createTrackBalanceChangeOnce({ store: peggedAndLiquidityStore,  balanceSelector: selectors.eSpacePeggedBalance }),
    crossChainPeggedBalance: createTrackBalanceChangeOnce({ store: peggedAndLiquidityStore,  balanceSelector: selectors.crossChainPeggedBalance }),
};

export { trackBalanceChangeOnce };

export const recheckApproval = () => balanceStore.setState({ reCheckApproveCount: 15 });

export const setTransferBalance = (standardUnit: string | undefined) => {
    const maxAvailableBalance = balanceStore.getState().maxAvailableBalance;
    if (!standardUnit || !maxAvailableBalance) {
        balanceStore.setState({ transferBalance: undefined });
        return;
    }

    let transferBalance = Unit.fromStandardUnit(standardUnit);
    if (Unit.greaterThan(transferBalance, maxAvailableBalance)) {
        transferBalance = maxAvailableBalance;
    }

    balanceStore.setState({ transferBalance });
};

export const checkNeedApprove = () => {
    const { transferBalance, approvedBalance } = balanceStore.getState();
    if (!transferBalance || !approvedBalance) return undefined;

    return Unit.lessThan(approvedBalance, transferBalance);
};

export const useNeedApprove = (token: Token) => {
    const approvedBalance = balanceStore(selectors.approvedBalance);
    const transferBalance = balanceStore(selectors.transferBalance);
    const reCheckApproveCount = balanceStore(selectors.reCheckApproveCount);

    if (token.isNative || !transferBalance) return false;
    if (reCheckApproveCount! > 0 || !approvedBalance) return undefined;
    return Unit.lessThan(approvedBalance, transferBalance);
};

export const useBalance = () => balanceStore(selectors.balance);

export const useMaxAvailableBalance = () => balanceStore(selectors.maxAvailableBalance);

export const useHasPeggedCFX = () => {
    const eSpacePeggedBalance = peggedAndLiquidityStore(selectors.eSpacePeggedBalance);
    const crossChainPeggedBalance = peggedAndLiquidityStore(selectors.crossChainPeggedBalance);
    return (eSpacePeggedBalance && Unit.greaterThan(eSpacePeggedBalance, Unit.fromStandardUnit(0))) || (crossChainPeggedBalance && Unit.greaterThan(crossChainPeggedBalance, Unit.fromStandardUnit(0)));
}

export const useESpacePeggedBalance = () => peggedAndLiquidityStore(selectors.eSpacePeggedBalance);
export const useCrossChainPeggedBalance = () => peggedAndLiquidityStore(selectors.crossChainPeggedBalance);
export const useESpaceMaximumLiquidity = () => peggedAndLiquidityStore(selectors.eSpaceMaximumLiquidity);
export const useCrossMaximumLiquidity = () => peggedAndLiquidityStore(selectors.crossChainMaximumLiquidity);

export const useIsTransferHasEnoughLiquidity = (token: Token) => {
    const transferBalance = balanceStore(selectors.transferBalance);
    const eSpaceMaximumLiquidity = peggedAndLiquidityStore(selectors.eSpaceMaximumLiquidity);
    const crossChainMaximumLiquidity = peggedAndLiquidityStore(selectors.crossChainMaximumLiquidity);
    const currentFromChain = useCurrentFromChain();
    const maximumLiquidity = currentFromChain === 'crossChain' ? eSpaceMaximumLiquidity : crossChainMaximumLiquidity;
    if (token.isPeggedToken) return [true, undefined];
    if (!currentFromChain || !transferBalance || !maximumLiquidity) return [true, undefined];
    return [Unit.lessThanOrEqualTo(transferBalance, maximumLiquidity), maximumLiquidity];
}