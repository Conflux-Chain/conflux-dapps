import LRUCache from "./LRUCache";

const cache = new LRUCache<string>(256, "LRUCacheFunction");

const LRUCacheFunction = <T extends Function>(func: T, cacheKey: string): T => {
    const cacheFunc = (...args: any) => {
        const argsHash = args.reduce((pre: string, cur: any) => pre + (typeof cur === 'object' ? JSON.stringify(cur) : String(cur)), '');
        const cacheRes = cache.get(cacheKey + argsHash);
        if (cacheRes !== null) {
            return cacheRes;
        }
        const res = func(...args);
        cache.set(cacheKey + argsHash, res);
        return res;
    }

    return cacheFunc as unknown as T;
}

export default LRUCacheFunction;