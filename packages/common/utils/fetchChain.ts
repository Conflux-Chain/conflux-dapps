interface FetchParams {
    rpcUrl: string;
    method: string;
    params?: any;
}

const fetchChain = ({ rpcUrl, method, params }: FetchParams) =>
    fetch(rpcUrl, {
        body: JSON.stringify({
            jsonrpc: '2.0',
            method,
            params,
            id: 1,
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
    }).then((response) => response.json()).then(res => res?.result as any)

const intervalFetchChain =
    <T>(fetchParams: FetchParams, { intervalTime, callback }: { intervalTime: number; callback: (res: T) => void }) =>
    () => {
        fetchChain(fetchParams).then(callback);
        const interval = setInterval(() => fetchChain(fetchParams).then(callback), intervalTime) as unknown as number;

        return () => {
            if (interval !== null) {
                clearInterval(interval);
            }
        }
    };

export { fetchChain, intervalFetchChain };
