import { getContract, signer } from '.';
import { DataSourceType, PostAPPType, DefinedContractNamesType, APPDataSourceType, UsersDataSourceType, CSVType } from 'payment/src/utils/types';
import lodash from 'lodash-es';
import { showToast } from 'common/components/showPopup/Toast';
import { ethers } from 'ethers';

interface RequestProps {
    name: DefinedContractNamesType;
    address?: string;
    method: string;
    args?: Array<any>;
}

const request = async (params: RequestProps | RequestProps[]) => {
    try {
        if (Array.isArray(params)) {
            if (params.length) {
                return await Promise.all(
                    params.map((p, i) => {
                        const { name, method, args = [], address = '' } = p;
                        const contract = getContract(name, address);
                        return contract[method](...args);
                    })
                );
            } else {
                return [];
            }
        } else {
            const { name, method, args = [] } = params;
            const contract = getContract(name);
            return await contract[method](...args);
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
            address: appContracts[i],
            name: d[0],
            baseURL: d[1],
            owner: d[2],
            earnings: (d[3] as ethers.BigNumber).toString(),
        }));

        return r;
    } catch (error) {
        console.log('getAPPs error: ', error);
        return [];
    }
};

export const postAPP = async ({ name, url, weight }: PostAPPType) => {
    try {
        return await (
            await getContract('controller').connect(signer).createApp(name, url, '', weight, {
                type: 0,
            })
        ).wait();
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
            requests: data[4].toNumber(),
            users: data[5]['total'].toNumber(),
            resources: {
                list: data[6][0].map((d: any) => ({
                    resourceId: d.resourceId,
                    weight: d.weight,
                    requests: d.requestTimes,
                    submitTimestamp: d.submitSeconds,
                })),
                total: data[6][1].toNumber(),
            },
        };
    } catch (error: any) {
        console.log('getAPP error: ', error);
        return {
            name: '',
            baseURL: '',
            owner: '',
            earnings: 0,
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
        const methods: Array<[string, number[]]> = [['listUser', [0, 1e8]]];

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
            const methodsOfBalance: Array<[string, string[]]> = users.map((u: { user: string }) => ['balanceOfWithAirdrop', [u.user]]);

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

export const airdrop = async (list: CSVType, address: string) => {
    try {
        const params = list.reduce(
            (prev, curr) => {
                if (ethers.utils.isAddress(curr[0])) {
                    prev[0].push(curr[0]);
                    prev[1].push(ethers.utils.parseUnits(String(curr[1]), 18));
                    prev[2].push(curr[2] || '');
                }
                return prev;
            },
            [[], [], []] as Array<(string | ethers.BigNumber | number)[]>
        );

        return (
            await getContract('app', address)
                .connect(signer)
                .airdropBatch(...params, {
                    type: 0,
                })
        ).wait();
    } catch (error: any) {
        console.log('airdrop error: ', error);
        showToast(`Request failed, details: ${error.message}`, { type: 'failed' });
        throw error;
    }
};

export const getAllowance = async ({ account, tokenAddr }: { account: string; tokenAddr: string }) => {
    const contract = getContract('erc20', tokenAddr);
    const apiAddr = await getContract('controller').api();
    return await contract.allowance(account, apiAddr);
};

export const approve = async ({ tokenAddr, amount = (1e50).toLocaleString('fullwide', { useGrouping: false }) }: { tokenAddr: string; amount?: string }) => {
    const contract = getContract('erc20', tokenAddr);
    const apiAddr = await getContract('controller').api();
    return (
        await contract.connect(signer).approve(apiAddr, amount, {
            type: 0,
        })
    ).wait();
};

export const deposit = async ({ amount, appAddr }: { account: string; amount: string; tokenAddr: string; appAddr: string }) => {
    const apiAddr = await getContract('controller').api();
    const contract = getContract('api', apiAddr);
    return (
        await contract.connect(signer).depositBaseToken(ethers.utils.parseUnits(amount), appAddr, {
            type: 0,
        })
    ).wait();
};

export const getPaidAPPs = async (account: string) => {
    try {
        const apiAddr = await getContract('controller').api();
        const contract = getContract('api', apiAddr);
        const apps = await contract.listPaidApp(account, 0, 1e15);

        // copy from getAPPs, need to optimized
        const appContracts = apps[0];
        const methods = ['name', 'symbol', 'appOwner', 'totalCharged'];
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
            address: appContracts[i],
            name: d[0],
            baseURL: d[1],
            owner: d[2],
            earnings: (d[3] as ethers.BigNumber).toString(),
        }));

        return r;
    } catch (error) {
        console.log('getAPPs error: ', error);
        return [];
    }
};
