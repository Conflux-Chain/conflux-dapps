import create from 'zustand';
import { store as walletStore } from '@cfxjs/use-wallet/dist/ethereum';
import { currentESpaceConfig } from 'espace-bridge/src/store';
import { isEqual } from 'lodash-es';
import LocalStorage from 'common/utils/LocalStorage';

interface Deposit {
    deposit_id: string;
    src_chain_id: string;
    dest_chain_id: string;
    token_abbr: string;
    depositor: string;
    deposit_token: string;
    amount: string;
    receiver: string;
    receive_token: string;
    status: string;
    timestamp: number;
    deposit_tx_hash: string;
    claim_tx_to: string; 
    claim_tx_input: string;
    claim_tx_hash: string;
}

interface DepositListStore {
    depositList: Array<Deposit>;
}

export const depositListStore = create<DepositListStore>(() => ({
    depositList: LocalStorage.get('depositList', 'espace-bridge') as Array<Deposit> ?? []
}));

const depositListSelector = (state: DepositListStore) => state.depositList;
export const useDepositList = () => depositListStore(depositListSelector);

export const addTempDepositToList = (deposit: { deposit_tx_hash: string; timestamp: number; }) => {
    const localDepositList = depositListStore.getState().depositList;
    const newDepositList = [{ ...deposit, status: 'WAIT_FOR_CONFIRM' } as Deposit, ...localDepositList].sort((a, b) => +b.timestamp - +a.timestamp);
    LocalStorage.set('depositList', newDepositList, 0, 'espace-bridge');
    depositListStore.setState({ depositList: newDepositList });
}

const mergeFetchedToLocal = (fetchedList: Array<Deposit>) => {
    const localDepositList = depositListStore.getState().depositList;
    const tempList = localDepositList.filter(localItem => !fetchedList.some(fetchedItem => localItem.deposit_tx_hash === fetchedItem.deposit_tx_hash));
    const mergeRes = [...tempList, ...fetchedList].sort((a, b) => +b.timestamp - +a.timestamp);
    if (!isEqual(mergeRes, localDepositList)) {
        LocalStorage.set('depositList', mergeRes, 0, 'espace-bridge');
        console.log('mergeFetchedToLocal: ', mergeRes);
        depositListStore.setState({ depositList: mergeRes });
    }
}

const fetchDepositList = (account: string) => {
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
            mergeFetchedToLocal(res.result)
        })
        .catch(err => {});
}

let subTimer: number | null = null;
const pollingFetch = (account: string) => {
    if (subTimer !== null) {    
        clearInterval(subTimer);
    }

    fetchDepositList(account);
    subTimer = setInterval(() => fetchDepositList(account), 1000) as unknown as number;
}

export const startSubDepositList = () => {
    const unsub = walletStore.subscribe(state => state.accounts, (accounts) => {
        const account = accounts?.[0];
        if (!account) return;
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