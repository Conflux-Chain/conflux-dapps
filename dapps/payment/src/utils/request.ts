import { getContract, signer, formatNumber } from '.';
import { DataSourceType, PostAPPType, DefinedContractNamesType, APPDataSourceType, UsersDataSourceType, CSVType } from 'payment/src/utils/types';
import lodash from 'lodash-es';
import { showToast } from 'common/components/showPopup/Toast';
import { BigNumber, ethers } from 'ethers';
import { CONTRACT_ABI } from 'payment/src/contracts/constants';
import { FormatTypes } from 'ethers/lib/utils';

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
                balance: formatNumber(dataOfBalance[i].total, {
                    limit: 0,
                    decimal: 18,
                }),
                airdrop: formatNumber(dataOfBalance[i].airdrop_, {
                    limit: 0,
                    decimal: 18,
                }),
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
        const Interface = new ethers.utils.Interface(CONTRACT_ABI['app']);
        const apiAddr = await getContract('controller').api();
        const apiContract = getContract('api', apiAddr);
        const apps = await apiContract.listPaidApp(account, 0, 1e15);
        const appContracts: string[] = apps[0];

        const calls: Array<[string, string[]?]> = [
            ['name'],
            ['symbol'],
            ['appOwner'],
            ['totalCharged'],
            ['balanceOfWithAirdrop', [account]],
            ['frozenMap', [account]],
            ['forceWithdrawDelay'],
        ];

        const multicall = getContract('multicall');
        const promises = lodash.flattenDepth(
            appContracts.map((a) => calls.map((c) => [a, Interface.encodeFunctionData(...c)])),
            1
        );

        const results: { returnData: ethers.utils.Result } = await multicall.callStatic.aggregate(promises);

        const data = lodash
            .chunk(results.returnData, calls.length)
            .map((r) => {
                return r.map((d, i) => {
                    return Interface.decodeFunctionResult(calls[i][0], d);
                });
            })
            .map((d, i) => {
                return {
                    address: appContracts[i],
                    name: d[0][0],
                    baseURL: d[1][0],
                    owner: d[2][0],
                    earnings: formatNumber(d[3][0] as any),
                    balance: formatNumber((d[4] as any).total, {
                        l4mit: 0,
                        decimal: 18,
                    }),
                    airdrop: formatNumber((d[4] as any).airdrop_, {
                        limit: 0,
                        decimal: 18,
                    }),
                    frozen: formatNumber((d[5][0] as any).toString()),
                    forceWithdrawDelay: d[6][0].toString(),
                };
            });

        return data;
    } catch (error) {
        console.log('getPaidAPPs error: ', error);
        return [];
    }
};

export const getAPIKey = async (appAddr: string) => {
    try {
        const seed = `${appAddr}_${Date.now()}`;
        const sig = await signer.signMessage(seed);
        const str = JSON.stringify({ msg: seed, sig });
        return ethers.utils.base64.encode(ethers.utils.toUtf8Bytes(str));
    } catch (error) {
        console.log('getAPIKey error: ', error);
        throw error;
    }
};

export const withdrawRequest = async (appAddr: string) => {
    try {
        return (await getContract('app', appAddr).connect(signer).withdrawRequest()).wait();
    } catch (error) {
        console.log('withdrawRequest error: ', error);
        throw error;
    }
};
