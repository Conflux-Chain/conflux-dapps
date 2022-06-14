type Data = string | number | boolean | undefined | null | Object;

interface DataObj {
    key: string;
    data: Data;
    exp?: number;
    namespace?: string;
}

interface LocalStorage {
    set: (key: string, data: Data, exp?: number, namespace?: string) => LocalStorage;
    setMuilty: (datas: DataObj[], namespace?: string) => LocalStorage;
    remove: (key: string, namespace?: string) => Data;
    get: (key: string, namespace?: string) => Data;
    getMuilty: <T extends string>(keys: T[], namespace?: string) => { [K in T]: Data };
    getAll: (namespace?: string) => { [key: string]: Data };
    setNamespace: (namespace: string) => LocalStorage;
    getNamespace: () => string;
    getAllNamespace: () => string[];
    clear: (namespace?: string) => LocalStorage;
    clearAll: () => LocalStorage;
}


function createLocalStorage(): LocalStorage {
    const _mark: string = 'localStorage_enhance_old';
    let _namespace: string = 'default';
    if (!localStorage.getItem(_mark)) localStorage.setItem(_mark, JSON.stringify({ [_namespace]: {} }));
    const LocalStorage: LocalStorage = Object.create(null);
    Object.assign(LocalStorage, {
        set(key: string, data: Data, exp: number = 0, namespace: string = _namespace): LocalStorage {
            const localValue = JSON.parse(localStorage.getItem(_mark) as string);
            if (!localValue[namespace]) localValue[namespace] = {};
            localValue[namespace][key] = { data, time: new Date().getTime(), exp };
            localStorage.setItem(_mark, JSON.stringify(localValue));
            return this;
        },
        setMuilty(datas: DataObj[], namespace: string = _namespace): LocalStorage {
            datas.forEach(data => this.set(data.key, data.data, data.exp ?? 0, data.namespace ?? namespace));
            return this;
        },
        remove(key: string, namespace: string = _namespace): Data {
            const localValue = JSON.parse(localStorage.getItem(_mark) as string);
            if (!localValue[namespace]?.[key]) return null;
            const target = localValue[namespace][key];
            delete localValue[namespace][key];
            localStorage.setItem(_mark, JSON.stringify(localValue));
            return target.data;
        },
        get(key: string, namespace: string = _namespace): Data {
            const localValue = JSON.parse(localStorage.getItem(_mark) as string);
            if (!localValue[namespace]?.[key]) return null;
            const target = localValue[namespace][key];

            if (target.exp > 0 && new Date().getTime() - target.time > target.exp) {
                delete localValue[namespace][key];
                localStorage.setItem(_mark, JSON.stringify(localValue));
                return null;
            }
            return target.data;
        },
        getMuilty<T extends string>(keys: T[], namespace?: string): { [K in T]: Data } {
            return keys.reduce((res, key) => {
                res[key] = this.get(key, namespace);
                return res;
            }, Object.create(null));
        },
        getAll(namespace: string = _namespace, sortByTime: boolean = true): { [key: string]: Data } {
            const localValue = JSON.parse(localStorage.getItem(_mark) as string);
            if (!localValue[namespace]) return {};
            const res = Object.entries(localValue[namespace]) as Array<[string, { data: Data, time: number }]>;
            if (sortByTime) res.sort((a, b) => a[1].time - b[1].time );

            return Object.fromEntries(res.map(item => [item[0], item[1].data]));
        },
        setNamespace(namespace: string): LocalStorage {
            _namespace = namespace;
            const localValue = JSON.parse(localStorage.getItem(_mark) as string);
            if (!localValue[namespace]) {
                localValue[namespace] = {};
                localStorage.setItem(_mark, JSON.stringify(localValue));
            }
            return this;
        },
        getNamespace(): string {
            return _namespace;
        },
        getAllNamespace(): string[] {
            const localValue = JSON.parse(localStorage.getItem(_mark) as string);
            return Object.getOwnPropertyNames(localValue);
        },
        clear(namespace: string = _namespace): LocalStorage {
            const localValue = JSON.parse(localStorage.getItem(_mark) as string);
            delete localValue[namespace];
            localStorage.setItem(_mark, JSON.stringify(localValue));
            return this;
        },
        clearAll(): LocalStorage {
            const localValue = JSON.parse(localStorage.getItem(_mark) as string);
            Object.getOwnPropertyNames(localValue).forEach(namespace => this.clear(namespace));
            return this;
        }
    });
    Object.getOwnPropertyNames(LocalStorage).forEach(
        <T extends keyof LocalStorage>(func: string) =>
            ((LocalStorage[func as T] as any) = LocalStorage[func as T].bind(LocalStorage))
    );
    Object.freeze(LocalStorage);
    return LocalStorage;
}

const LocalStorage = createLocalStorage();

export default LocalStorage;
