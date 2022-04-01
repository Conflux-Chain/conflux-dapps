import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as walletStore, provider, Unit } from '@cfxjs/use-wallet/dist/ethereum';
import { networkStore } from './index';
import { contractStore } from './contract';
import { tokenStore, type Token} from './token';

interface BalanceStore {
    balance?: Unit;
    maxAvailableBalance?: Unit;
    transferBalance?: Unit;
    peggedBalance?: Unit;
    maximumLiquidity?: Unit;

    approvedBalance?: Unit;
    reCheckApproveCount?: number;
}

interface CrossChainBalanceStore extends BalanceStore {}

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

export const startSubBalance = () => {
    const unSubExec: Function[] = [];

    // track currentToken balance and approvedBalance
    (function() {
        let balanceTick = 0;
        if (!provider) return;

        const getAccount = () => walletStore.getState().accounts?.[0];

        // same balance should not reset obj state causes duplicate render.
        const handleBalanceChanged = (newBalance: Unit, type: 'balance' | 'approvedBalance' | 'maximumLiquidity', currentBalanceTick: number) => {
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

        const getBalance = ({ callback, currentFrom, token }: { callback?: () => void; currentFrom: 'eSpace' | 'crossChain'; token?: Token; }) => {
            const account = getAccount();
            if (!account) {
                return;
            }

            const currentBalanceTick = balanceTick;
            balanceTick += 1;

            // if From is eSpace, directly get balance from @cfxjs/use-wallet
            if (currentFrom === 'eSpace' && token?.isNative) {
                handleBalanceChanged(walletStore.getState().balance!, 'balance', currentBalanceTick);
                callback?.();
                return;
            }

            // if From is crossChain, get balance from call method
            if (!token?.address) return;
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
            const { token } = tokenStore.getState();
            
            if (!currentFrom || chainId !== (currentFrom === 'eSpace' ? eSpace.networkId : crossChain.networkId)) {
                clearBalanceTimer();
                clearUndefinedTimer();
                balanceStore.setState({ balance: undefined, approvedBalance: undefined, maximumLiquidity: undefined });
                return;
            }

            clearUndefinedTimer();

            // Prevent interface jitter from having a value to undefined to having a value again in a short time when switching tokens.
            // Shortly fail to get the value and then turn to undefined
            setUndefinedTimer = (setTimeout(() => {
                balanceStore.setState({ balance: undefined, approvedBalance: undefined, maximumLiquidity: undefined });
                setUndefinedTimer = null;
            }, 50) as unknown) as number;

            const account = getAccount();
            if (!account) {
                balanceStore.setState({ balance: undefined });
                clearBalanceTimer();
                return;
            }

            // Clear the setUndefinedTimer after first fetch balance, if this timer is not already in effect.
            setTimeout(() => getBalance({ callback: clearUndefinedTimer, currentFrom, token  }), 10);

            clearBalanceTimer();
            balanceTimer = (setInterval(() => getBalance({ currentFrom, token }), 1500) as unknown) as number;
        };

        unSubExec.push(walletStore.subscribe((state) => state.accounts, () => { setTimeout(trackBalance, 10); }, { fireImmediately: true }));
        unSubExec.push(walletStore.subscribe((state) => state.chainId, () => { setTimeout(trackBalance, 10); }, { fireImmediately: true }));
        unSubExec.push(networkStore.subscribe((state) => state.currentFrom, () => { setTimeout(trackBalance, 10); }, { fireImmediately: true }));
        unSubExec.push(tokenStore.subscribe((state) => state.token, () => { setTimeout(trackBalance, 10); }, { fireImmediately: true }));

        unSubExec.push(() => {
            clearBalanceTimer();
            clearUndefinedTimer();
        });
    }());

    // trackMaxAvailableBalance
    (function() {
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
            const { chainId } = walletStore.getState();
            const { eSpace, crossChain, currentFrom } = networkStore.getState();
            const { token } = tokenStore.getState();

            if (!currentFrom || !balance || !account || chainId !== (currentFrom === 'eSpace' ? eSpace.networkId : crossChain.networkId)) {
                clearUndefinedTimer();
                balanceStore.setState({ maxAvailableBalance: undefined });
                return;
            }


            if (currentFrom === 'eSpace' && token.isNative) {
                // estimate MetaMask max available balance
                if (!provider) return;

                Promise.all([
                    provider.request({
                        method: 'eth_estimateGas',
                        params: [
                            {
                                from: account,
                                to: '0x8a4c531EED1205E0eE6E34a1092e0298173a659d',
                                value: balance.toHexMinUnit(),
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
        }
        
        const unsub1 = balanceStore.subscribe((state) => state.balance, () => { setTimeout(trackBalance, 10); }, { fireImmediately: true });
        const unsub2 = tokenStore.subscribe((state) => state.token, () => { setTimeout(trackBalance, 10); }, { fireImmediately: true });
        unSubExec.push(unsub1, unsub2);
        unSubExec.push(() => {
            clearUndefinedTimer();
        });
    }());

    return () => {
        unSubExec.forEach((unsub) => unsub());
    };
};

const selectors = {
    balance: (state: BalanceStore) => state.balance,
    transferBalance: (state: BalanceStore) => state.transferBalance,
    maxAvailableBalance: (state: BalanceStore) => state.maxAvailableBalance,
    approvedBalance: (state: CrossChainBalanceStore) => state.approvedBalance,
    reCheckApproveCount: (state: CrossChainBalanceStore) => state.reCheckApproveCount,
    maximumLiquidity: (state: BalanceStore) => state.maximumLiquidity,
} as const;

// track balance change once
const createTrackBalanceChangeOnce = ({ balanceSelector }: { balanceSelector: ValueOf<typeof selectors> }) => (callback: () => void) => {
    if (!callback) return;
    let unsubBalance: Function | null = null;
    let unsubAccount: Function | null = null;
    if (walletStore) {
        unsubAccount = walletStore.subscribe(
            (state) => [state.accounts, state.chainId],
            () => {
                if (!unsubAccount) return;
                if (unsubBalance) {
                    unsubBalance();
                    unsubBalance = null;
                }
                unsubAccount();
                unsubAccount = null;
            }
        );
    }

    unsubBalance = balanceStore.subscribe(balanceSelector as typeof selectors['balance'], () => {
        if (!unsubBalance) return;
        callback();
        unsubBalance();
        unsubBalance = null;
    });
};

const trackBalanceChangeOnce = {
    balance: createTrackBalanceChangeOnce({ balanceSelector: selectors.balance }),
    approvedBalance: createTrackBalanceChangeOnce({ balanceSelector: selectors.approvedBalance }),
    maxAvailableBalance: createTrackBalanceChangeOnce({ balanceSelector: selectors.maxAvailableBalance }),
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
