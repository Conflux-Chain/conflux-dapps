import { isEqual } from 'lodash';

interface FetchParams {
    rpcUrl: string;
    method: string;
    params?: any;
    equalKey?: string;
}

const equalMap = new Map<string, any>();

const fetchChain = ({ rpcUrl, method, params, equalKey }: FetchParams) =>
    fetch(rpcUrl, {
        body: JSON.stringify({
            jsonrpc: '2.0',
            method,
            params,
            id: 1,
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
    }).then((response) => response.json()).then(res => {
        const result = res?.result;
        if (typeof equalKey !== 'string') return result;
        const lastResult = equalMap.get(equalKey);
        if (isEqual(lastResult, result)) {
            throw new Error('fetchChain: equal');
        } else {
            equalMap.set(equalKey, result);
            return result;
        }
    })

const intervalFetchChain =
    <T>(fetchParams: FetchParams, { intervalTime, callback }: { intervalTime: number; callback: (res: T) => void }) =>
    () => {
        fetchChain(fetchParams).then(callback).catch(() => {});
        const interval = setInterval(() => fetchChain(fetchParams).then(callback).catch(() => {}), intervalTime) as unknown as number;

        return () => {
            if (interval !== null) {
                clearInterval(interval);
            }
        }
    };

export { fetchChain, intervalFetchChain };
