import { useMemo } from 'react';
import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as walletStore, provider } from '@cfxjs/use-wallet-react/ethereum';
import Config from 'bsc-espace/config';
import { isEqual } from 'lodash-es';
import LocalStorage from 'localstorage-enhance';
import { showToast } from 'common/components/showPopup/Toast';

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
    tempDepositList: Array<Deposit> | null;
    depositList: Array<Deposit> | null;
    claimingList: Array<string>;
    inFetching: boolean;
}

export const depositListStore = create(subscribeWithSelector(() => ({
    inFetching: false,
    depositList: null,
    tempDepositList: null,
    claimingList: LocalStorage.getItem('claimingList', 'bsc-espace') as Array<string> ?? []
}) as DepositListStore));

const selector = {
    tempDepositList: (state: DepositListStore) => state.tempDepositList,
    depositList: (state: DepositListStore) => state.depositList,
    inFetching: (state: DepositListStore) => state.inFetching,
    claimingList: (state: DepositListStore) => state.claimingList,
}
export const useDepositList = () => {
    const depositList = depositListStore(selector.depositList);
    const filter = useMemo(() => depositList?.filter(deposit => deposit.status !== 'CLAIMED'), [depositList]);
    return filter;
}
export const useDepositInFetching = () => depositListStore(selector.inFetching);
export const useClaimingList = () => depositListStore(selector.claimingList);

export const setDepositClaiming = (deposit: Deposit) => {
    const preClaimingList = depositListStore.getState().claimingList ?? [];
    const newClaimingList = [...preClaimingList, deposit.deposit_tx_hash];
    LocalStorage.setItem({ key: 'claimingList', data: newClaimingList, namespace: 'bsc-espace' });
    depositListStore.setState({ claimingList: newClaimingList });
}

const mergeFetchedToLocal = (fetchedList: Array<Deposit>, account: string) => {
    const localDepositList = (depositListStore.getState().depositList ?? []);
    const claimableList = localDepositList.filter(localItem => !localItem.claim_tx_to && fetchedList.some(fetchedItem => localItem.deposit_tx_hash === fetchedItem.deposit_tx_hash && !!fetchedItem.claim_tx_to));
    const tempList = localDepositList.filter(localItem => !!localItem.deposit_tx_hash && !fetchedList.some(fetchedItem => localItem.deposit_tx_hash === fetchedItem.deposit_tx_hash));
    const mergeRes = [...tempList, ...fetchedList].sort((a, b) => +b.timestamp - +a.timestamp);

    if (claimableList?.length) {
        showToast(`${claimableList.length === 1 ? 'a' : claimableList.length} deposit can be claimable now.`, { type: 'success' });
    }
    if (!isEqual(mergeRes, localDepositList)) {
        LocalStorage.setItem({ key: `depositList-${account}`, data: mergeRes, namespace: 'bsc-espace' });
        depositListStore.setState({ depositList: mergeRes });
    }

    const preClaimingList = depositListStore.getState().claimingList;
    const newClaimingList = preClaimingList?.filter(deposit_tx_hash => {
        const targetDeposit = mergeRes.find(deposit => deposit.deposit_tx_hash === deposit_tx_hash);
        return targetDeposit?.status !== 'CLAIMED';
    });
    
    if (!isEqual(preClaimingList, newClaimingList)) {
        LocalStorage.setItem({ key: 'claimingList', data: newClaimingList, namespace: 'bsc-espace' });
        depositListStore.setState({ claimingList: newClaimingList });
        const successClaimedLength = ((preClaimingList?.length ?? 0) - (newClaimingList?.length ?? 0))
        showToast(`${successClaimedLength === 1 ? 'a' : successClaimedLength} deposit claimed success.`, { type: 'success' });
    }
}

const fetchDepositList = (account: string, isFirstFetch = false) => {
    if (isFirstFetch) {
        depositListStore.setState({ inFetching: true });
    }
    fetch(Config.serverUrl, {
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
        headers: {
            'content-type': 'application/json'
        },
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



let pollingFetchTimer: number | null = null;
const clearPollingFetchTimer = () => {
    if (pollingFetchTimer !== null) {    
        clearInterval(pollingFetchTimer);
        pollingFetchTimer = null;
    }
}
const pollingFetch = (account: string) => {
    clearPollingFetchTimer();
    fetchDepositList(account, true);
    pollingFetchTimer = setInterval(() => fetchDepositList(account), 1000) as unknown as number;
}

let checkReceiptTimer: number | null = null;
const clearTempListTimer = () => {
    if (checkReceiptTimer !== null) {
        clearTimeout(checkReceiptTimer);
        checkReceiptTimer = null;
    }
}

export const startSubDepositList = () => {
    const unsub1 = walletStore.subscribe(state => state.accounts, (accounts, preAccounts) => {
        const account = accounts?.[0];
        const preAccount = preAccounts?.[0];
        if (!!preAccount && account === preAccount && pollingFetchTimer !== null) return;
        if (!account) {
            clearPollingFetchTimer();
            clearTempListTimer();
            depositListStore.setState({ depositList: null, tempDepositList: null });
            return;
        }

        depositListStore.setState({
            depositList: LocalStorage.getItem(`depositList-${account}`, 'bsc-espace') as Array<Deposit>,
            tempDepositList: LocalStorage.getItem(`tempDepositList-${account}`, 'bsc-espace') as Array<Deposit>,
        });        
        pollingFetch(account);
    }, { fireImmediately: true }) 


    const unsub2 = depositListStore.subscribe(state => state.tempDepositList, (tempDepositList) => {
        if (!tempDepositList?.length || !provider) {
            clearTempListTimer();
            return;
        }

        const checkReceipt = async () => {
            const checkReceiptRes: any = await Promise.allSettled(tempDepositList.map(deposit => 
                provider!.request({
                    method: 'eth_getTransactionReceipt',
                    params: [deposit.deposit_tx_hash],
                })
            ));
            mergeTempDepositToLocal(checkReceiptRes, () => checkReceiptTimer = setTimeout(checkReceipt, 500) as unknown as number);
        }

        clearTempListTimer();
        checkReceipt();
    }, { fireImmediately: true });


    return () => {
        unsub1();
        unsub2();
        clearPollingFetchTimer();
        clearTempListTimer();
    }
}



export const addTempDepositToList = (deposit: Partial<Deposit>) => {
    if (!deposit.deposit_tx_hash) return;
    const account = walletStore.getState().accounts?.[0];
    const preTempDepositList = depositListStore.getState().tempDepositList ?? [];
    const newTempDepositList = [{ ...deposit, status: 'WAIT_FOR_CONFIRM' } as Deposit, ...preTempDepositList].sort((a, b) => +b.timestamp - +a.timestamp);
    LocalStorage.setItem({ key: `tempDepositList-${account}`, data: newTempDepositList, namespace: 'bsc-espace' });
    depositListStore.setState({ tempDepositList: newTempDepositList });
}

const mergeTempDepositToLocal = (checkReceiptRes: Array<{ status: 'fulfilled'; value: null | { transactionHash: string; status: string; }}>, startNextTimer: () => void) => {
    const preTempDepositList = depositListStore.getState().tempDepositList ?? [];
    const newTempDepositList = preTempDepositList?.filter(deposit => {
        const targetDeposit = checkReceiptRes.find(_receiptRes => deposit.deposit_tx_hash === _receiptRes.value?.transactionHash);
        return !targetDeposit || (targetDeposit && targetDeposit?.value?.status !== '0x1');
    });
    const successTempDepositList = preTempDepositList?.filter(deposit => {
        const targetDeposit = checkReceiptRes.find(_receiptRes => deposit.deposit_tx_hash === _receiptRes.value?.transactionHash);
        return targetDeposit?.value?.status === '0x1';
    });

    if (successTempDepositList?.length) {
        const account = walletStore.getState().accounts?.[0];
        const preDepositList = depositListStore.getState().depositList ?? [];
        const newDepositList = [...successTempDepositList, ...preDepositList];
        LocalStorage.setItem({ key: `depositList-${account}`, data: newDepositList, namespace: 'bsc-espace' });
        depositListStore.setState({ depositList: newDepositList });
        showToast(`${successTempDepositList.length === 1 ? 'a' : successTempDepositList.length} deposit is waiting for claimable now.`, { type: 'success' });
    }
    if (newTempDepositList?.length !== preTempDepositList?.length) {
        const account = walletStore.getState().accounts?.[0];
        LocalStorage.setItem({ key: `tempDepositList-${account}`, data: newTempDepositList, namespace: 'bsc-espace' });
        depositListStore.setState({ tempDepositList: newTempDepositList });
        if (!successTempDepositList?.length) {
            showToast(`your deposit is failed, see detail in MetaMask.`, { type: 'failed', duration: 10000 });
        }
    }
    if (!newTempDepositList?.length) {
        clearTempListTimer();
    } else {
        startNextTimer();
    }
}  