import { getContract, web3 } from '.';
import { DataSourceType, PostAPPType, DefinedContractNamesType, APPDataSourceType, UsersDataSourceType } from 'payment/src/utils/types';
import lodash from 'lodash-es';
import BN from 'bn.js';
import { showToast } from 'common/components/showPopup/Toast';

interface RequestProps {
    name: DefinedContractNamesType;
    address?: string;
    method: string;
    args?: Array<any>;
}

const request = async (params: RequestProps | RequestProps[]) => {
    try {
        if (Array.isArray(params)) {
            return new Promise((resolve, reject) => {
                try {
                    const batch = new web3.BatchRequest();
                    const results: any[] = Array(params.length);
                    let counter = params.length;
                    const cb = (error: any, result: any, i: number) => {
                        counter -= 1;
                        results[i] = error || result;
                        if (!counter) {
                            resolve(results);
                        }
                    };

                    params
                        .map((p, i) => {
                            const { name, method, args = [], address = '' } = p;
                            const contract = getContract(name, address);

                            return contract[method](...args).call.request({}, (e: any, r: any) => cb(e, r, i));
                        })
                        .forEach((i) => batch.add(i));

                    batch.execute();
                } catch (error) {
                    reject(error);
                }
            });
        } else {
            const { name, method, args = [] } = params;
            const contract = getContract(name);
            const data = await contract[method](...args).call();
            return data;
        }
    } catch (error: any) {
        console.log('request error: ', error);
        showToast(`Request failed, details: ${error}`, { type: 'failed' });
        throw error;
    }
};

export const getAPPs = async (creator?: string): Promise<DataSourceType[]> => {
    try {
        const method = creator ? 'listAppByCreator' : 'listApp';
        const args = creator ? [creator, 0, 1e8] : [0, 1e8];

        const apps = await request({
            name: 'controller',
            method,
            args,
        });
        const methods = ['name', 'symbol', 'appOwner', 'totalCharged'];

        const appContracts = creator ? apps[0].map((a: string[]) => a[0]) : apps[0];

        const appDetails = await request(
            lodash.flattenDeep([
                appContracts.map((a: string) =>
                    methods.map((m, i) => ({
                        name: 'app',
                        address: a,
                        method: m,
                        index: i,
                    }))
                ),
            ])
        );

        const r: any = lodash.chunk(appDetails, methods.length).map((d, i) => ({
            name: d[0],
            baseURL: d[1],
            address: appContracts[i],
            owner: d[2],
            earnings: d[3],
        }));

        return r;
    } catch (error) {
        console.log('getAPPs error: ', error);
        return [];
    }
};

export const postAPP = async ({ name, url, weight, account }: PostAPPType) => {
    try {
        return await getContract('controller').createApp(name, url, '', weight).send({ from: account });
    } catch (error: any) {
        console.log('postAPP error: ', error);
        showToast(`Request failed, details: ${error.message}`, { type: 'failed' });
        throw error;
    }
};

export const getAPP = async (address: RequestProps['address']): Promise<APPDataSourceType> => {
    try {
        const methods: Array<any> = [
            ['name'],
            ['symbol'],
            ['appOwner'],
            ['totalCharged'],
            ['totalRequests'],
            ['listUser', [0, 0]],
            ['listResources', [0, 1e8]],
        ];

        const data = await request(
            methods.map((m, i) => ({
                name: 'app',
                address: address,
                method: m[0],
                index: i,
                args: m[1],
            }))
        );

        return {
            name: data[0],
            baseURL: data[1],
            owner: data[2],
            earnings: data[3],
            requests: new BN(data[4]).toNumber(),
            users: new BN(data[5]['total']).toNumber(),
            resources: {
                list: data[6][0].map((d: any) => ({
                    resourceId: d.resourceId,
                    weight: d.weight,
                    requests: d.requestTimes,
                    submitTimestamp: d.submitSeconds,
                })),
                total: new BN(data[6][1]).toNumber(),
            },
        };
    } catch (error: any) {
        console.log('getAPP error: ', error);
        return {
            name: '',
            baseURL: '',
            owner: '',
            earnings: '',
            requests: 0,
            users: 0,
            resources: {
                list: [],
                total: 0,
            },
        };
    }
};

export const getAPPUsers = async (
    address: RequestProps['address']
): Promise<{
    list: UsersDataSourceType[];
    total: 0;
}> => {
    try {
        const methods: Array<any> = [['listUser', [0, 1e8]]];

        const data = (
            await request(
                methods.map((m, i) => ({
                    name: 'app',
                    address: address,
                    method: m[0],
                    index: i,
                    args: m[1],
                }))
            )
        )[0];

        let list = [];
        const users = data[0];
        const total = data[1];

        if (users.length) {
            const methodsOfBalance: Array<[string, [string]]> = users.map((u: { user: string }) => ['balanceOfWithAirdrop', [u.user]]);

            const dataOfBalance = await request(
                methodsOfBalance.map((m, i: number) => ({
                    name: 'app',
                    address: address,
                    method: m[0],
                    index: i,
                    args: m[1],
                }))
            );

            list = users.map((u: any, i: number) => ({
                address: u.user,
                balance: dataOfBalance[i].total,
                airdrop: dataOfBalance[i].airdrop_,
            }));
        }

        return {
            list,
            total,
        };
    } catch (error) {
        console.log('getAPPUsers error: ', error);
        return {
            list: [],
            total: 0,
        };
    }
};
