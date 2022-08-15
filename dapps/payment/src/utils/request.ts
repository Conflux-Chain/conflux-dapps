import { getContract, web3 } from '.';
import { DataSourceType, PostAPPType, DefinedContractNamesType } from 'payment/src/utils/types';
import { notification } from 'antd';
import lodash from 'lodash-es';

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
        notification.error({
            message: 'Error',
            description: error,
        });
        throw error;
    }
};

export const getAPPs = async (creator?: string): Promise<DataSourceType[]> => {
    try {        
        const method = creator ? 'listAppByCreator' : 'listApp'
        const args = creator ? [creator, 0, 1e8] : [0, 1e8]

        const apps = await request({
            name: 'controller',
            method,
            args,
        });
        const methods = ['name', 'symbol', 'appOwner', 'totalCharged'];

        const appContracts = creator ? apps[0].map((a:string[]) => a[0]) : apps[0]
        
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


export const postAPP = async ({
    name,
    url,
    weight,
    account
}: PostAPPType) => {
    try {
        return await getContract('controller').createApp(name, url, '', weight).send({from: account});
    } catch (error: any) {
        console.log('postAPP error: ', error);
        notification.error({
            message: 'Error',
            description: error,
        });
        return null;
    }
}
