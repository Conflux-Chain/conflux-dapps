import create from 'zustand';
import { store as walletStore } from '@cfxjs/use-wallet/dist/ethereum';
import { currentESpaceConfig } from 'espace-bridge/src/store';
import { isEqual } from 'lodash-es';
import LocalStorage from 'common/utils/LocalStorage';

export interface Deposit {
    deposit_id: string;
    src_chain_id: string;
    dest_chain_id: string;
    token_abbr: string;
    depositor: string;
    deposit_token: string;
    amount: string;
    receiver: string;
    receive_token: string;
    receive_amount: string; 
    status: null | 'WAIT_FOR_CONFIRM' | 'WAIT_FOR_SIGNATURE' | 'WAIT_FOR_CLAIM' | 'CLAIMED';
    timestamp: number;
    deposit_tx_hash: string;
    claim_tx_to: string; 
    claim_tx_input: string;
    claim_tx_hash: string;
    claim_result: any;
}

interface DepositListStore {
    depositList: Array<Deposit> | null;
    inFetching: boolean;
}

export const depositListStore = create<DepositListStore>(() => ({
    inFetching: false,
    depositList: null
}));

const selector = {
    depositList: (state: DepositListStore) => state.depositList,
    inFetching: (state: DepositListStore) => state.inFetching,
}
export const useDepositList = () => depositListStore(selector.depositList);
export const useDepositInFetching = () => depositListStore(selector.inFetching);

export const addTempDepositToList = (deposit: { deposit_tx_hash: string; timestamp: number; amount: string; }) => {
    const account = walletStore.getState().accounts?.[0];
    const localDepositList = depositListStore.getState().depositList ?? [];
    const newDepositList = [{ ...deposit, status: 'WAIT_FOR_CONFIRM' } as Deposit, ...localDepositList].sort((a, b) => +b.timestamp - +a.timestamp);
    LocalStorage.set(`depositList-${account}`, newDepositList, 0, 'espace-bridge');
    depositListStore.setState({ depositList: newDepositList });
}

const mergeFetchedToLocal = (fetchedList: Array<Deposit>, account: string) => {
    const localDepositList = depositListStore.getState().depositList ?? [];
    const tempList = localDepositList.filter(localItem => !fetchedList.some(fetchedItem => localItem.deposit_tx_hash === fetchedItem.deposit_tx_hash));
    const mergeRes = [...tempList, ...fetchedList].sort((a, b) => +b.timestamp - +a.timestamp);
    if (!isEqual(mergeRes, localDepositList)) {
        LocalStorage.set(`depositList-${account}`, mergeRes, 0, 'espace-bridge');
        depositListStore.setState({ depositList: mergeRes });
    }
}

const fetchDepositList = (account: string, isFirstFetch = false) => {
    if (isFirstFetch) {
        depositListStore.setState({ inFetching: true });
    }
    fetch(currentESpaceConfig.rpcUrl, {
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'getDepositList',
            params: [{
                account,
                status: null,
                offset: 0,
                limit: 100
            }],
            id: 1,
        }),
        headers: {'content-type': 'application/json'},
        method: 'POST',
    })
        .then(response => response.json())
        .then((res: { result: Array<Deposit>; }) => {
            if (!Array.isArray(res?.result)) return;
            const currentAccount = walletStore.getState().accounts?.[0];
            if (account !== currentAccount) return;
            mergeFetchedToLocal(res.result, account)
        })
        .catch(err => {})
        .finally(() => {
            if (isFirstFetch) {
                depositListStore.setState({ inFetching: false });
            }
        })
}

let subTimer: number | null = null;
const clearSubTimer = () => {
    if (subTimer !== null) {    
        clearInterval(subTimer);
        subTimer = null;
    }
}
const pollingFetch = (account: string) => {
    clearSubTimer();
    fetchDepositList(account, true);
    subTimer = setInterval(() => fetchDepositList(account), 1000) as unknown as number;
}

export const startSubDepositList = () => {
    const unsub = walletStore.subscribe(state => state.accounts, (accounts) => {
        const account = accounts?.[0];
        if (!account) {
            clearSubTimer();
            depositListStore.setState({ depositList: null });
            return;
        }

        depositListStore.setState({ depositList: LocalStorage.get(`depositList-${account}`, 'espace-bridge') as Array<Deposit> });        
        pollingFetch(account);
    }, { fireImmediately: true }) 

    return () => {
        unsub();
        if (subTimer !== null) {
            clearInterval(subTimer);
            subTimer = null;
        }
    }
}