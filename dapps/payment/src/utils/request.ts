import { getContract, signer, formatNumber } from '.';
import {
    DataSourceType,
    PostAPPType,
    DefinedContractNamesType,
    APPDataSourceType,
    UsersDataSourceType,
    CSVType,
    ContractCall,
    APPResourceType,
    ResourceDataSourceType,
} from 'payment/src/utils/types';
import lodash from 'lodash-es';
import { showToast } from 'common/components/showPopup/Toast';
import { ethers } from 'ethers';
import { CONTRACT_ABI } from 'payment/src/contracts/constants';

interface RequestProps {
    name: DefinedContractNamesType;
    address?: string;
    method: string;
    args?: Array<any>;
}

interface ErrorType {
    message: string;
}

type EditableAPI = Pick<ResourceDataSourceType, 'resourceId' | 'index' | 'op' | 'weight'>;

const INTERFACE_APP = new ethers.utils.Interface(CONTRACT_ABI['app']);
const MULTICALL = getContract('multicall');
const CONTRACT_CONTROLLER = getContract('controller');

const noticeError = (e: unknown) => {
    let msg = '';
    if (typeof e === 'string') {
        msg = e;
    } else if (typeof (e as ErrorType).message === 'string') {
        console.log((e as ErrorType).message);
        msg = (e as ErrorType).message;
    } else {
        msg = e as any;
    }
    showToast(`Request failed, details: ${msg}`, { type: 'failed' });
};

export const getAPPs = async (creator?: string): Promise<DataSourceType[]> => {
    try {
        const method = creator ? 'listAppByCreator' : 'listApp';
        const args = creator ? [creator, 0, 1e8] : [0, 1e8];
        const apps = await CONTRACT_CONTROLLER[method](...args);

        const appContracts = creator ? apps[0].map((a: string[]) => a[0]) : apps[0];

        const calls: ContractCall[] = [['name'], ['symbol'], ['appOwner'], ['totalCharged']];
        const promises = lodash.flattenDepth(
            appContracts.map((a: any) => calls.map((c) => [a, INTERFACE_APP.encodeFunctionData(...c)])),
            1
        );
        const results: { returnData: ethers.utils.Result } = await MULTICALL.callStatic.aggregate(promises);

        const r: any = lodash
            .chunk(results.returnData, calls.length)
            .map((r) => r.map((d, i) => INTERFACE_APP.decodeFunctionResult(calls[i][0], d)))
            .map((d, i) => ({
                address: appContracts[i],
                name: d[0][0],
                baseURL: d[1][0],
                owner: d[2][0],
                earnings: formatNumber(d[3][0], {
                    limit: 0,
                    decimal: 18,
                }),
            }));

        return r;
    } catch (error) {
        console.log('getAPPs error: ', error);
        noticeError(error);
        return [];
    }
};

export const postAPP = async ({ name, url, weight }: PostAPPType) => {
    try {
        return await (
            await CONTRACT_CONTROLLER.connect(signer).createApp(name, url, '', ethers.utils.parseUnits(String(weight)), {
                type: 0,
            })
        ).wait();
    } catch (error) {
        console.log('postAPP error: ', error);
        noticeError(error);
        throw error;
    }
};

export const getAPP = async (address: RequestProps['address']): Promise<APPDataSourceType> => {
    try {
        const calls: Array<[string, any[]?]> = [
            ['name'],
            ['symbol'],
            ['appOwner'],
            ['totalCharged'],
            ['totalRequests'],
            ['listUser', [0, 0]],
            ['listResources', [0, 0]],
        ];
        const promises = calls.map((c) => [address, INTERFACE_APP.encodeFunctionData(...c)]);
        const results: { returnData: ethers.utils.Result } = await MULTICALL.callStatic.aggregate(promises);
        const r = results.returnData.map((d, i) => INTERFACE_APP.decodeFunctionResult(calls[i][0], d));

        return {
            name: r[0][0],
            baseURL: r[1][0],
            owner: r[2][0],
            earnings: formatNumber(r[3][0], {
                limit: 0,
                decimal: 18,
            }),
            requests: r[4][0].toNumber(),
            users: r[5]['total'].toNumber(),
            resources: {
                list: [],
                total: r[6][1].toNumber(),
            },
        };
    } catch (error) {
        console.log('getAPP error: ', error);
        noticeError(error);
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

export const getAPPAPIs = async (address: RequestProps['address']): Promise<APPResourceType> => {
    try {
        const contract = await getContract('app', address);
        const pendingSeconds = await contract.pendingSeconds();
        const data = await contract.listResources(0, 1e8);

        return {
            list: data[0].map((d: any) => ({
                resourceId: d.resourceId,
                weight: ethers.utils.formatUnits(d.weight),
                requests: d.requestTimes.toString(),
                submitTimestamp: d.submitSeconds.toString(),
                pendingOP: d.pendingOP.toString(), // 0-add 1-edit 2-delete 3-no pending 4-?
                index: d.index,
                pendingSeconds: pendingSeconds.toNumber(),
                pendingWeight: ethers.utils.formatUnits(d.pendingWeight),
            })),
            total: data.total.toNumber(),
        };
    } catch (error) {
        console.log('getAPP error: ', error);
        noticeError(error);
        return {
            list: [],
            total: 0,
        };
    }
};

export const configAPPAPI = async (address: RequestProps['address'], data: EditableAPI): Promise<any> => {
    try {
        return await (
            await getContract('app', address)
                .connect(signer)
                .configResource([data.index, data.resourceId, ethers.utils.parseUnits(String(data.weight)), data.op])
        ).wait();
    } catch (error) {
        console.log(error);
        noticeError(error);
        throw error;
    }
};

export const deleteAPPAPI = async (address: RequestProps['address'], data: EditableAPI): Promise<any> => {
    try {
        return await (
            await getContract('app', address)
                .connect(signer)
                .configResource([data.index, data.resourceId, ethers.utils.parseUnits(data.weight), data.op])
        ).wait();
    } catch (error) {
        console.log(error);
        noticeError(error);
        throw error;
    }
};

export const getAPPUsers = async (
    address: RequestProps['address']
): Promise<{
    list: UsersDataSourceType[];
    total: 0;
}> => {
    try {
        const data = await getContract('app', address).listUser(0, 1e8);

        let list = [];
        const users = data[0];
        const total = data[1];

        if (users.length) {
            const calls: ContractCall[] = users.map((u: { user: string }) => ['balanceOfWithAirdrop', [u.user]]);
            const promises = calls.map((c) => [address, INTERFACE_APP.encodeFunctionData(...c)]);
            const results: { returnData: ethers.utils.Result } = await MULTICALL.callStatic.aggregate(promises);
            const r = results.returnData.map((d, i) => INTERFACE_APP.decodeFunctionResult(calls[i][0], d));

            list = users.map((u: any, i: number) => ({
                address: u.user,
                balance: formatNumber(r[i].total.sub(r[i].airdrop_), {
                    limit: 0,
                    decimal: 18,
                }),
                airdrop: formatNumber(r[i].airdrop_, {
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
        noticeError(error);
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
    } catch (error) {
        console.log('airdrop error: ', error);
        noticeError(error);
        throw error;
    }
};

export const getAllowance = async ({ account, tokenAddr }: { account: string; tokenAddr: string }) => {
    try {
        const contract = getContract('erc20', tokenAddr);
        const apiAddr = await CONTRACT_CONTROLLER.api();
        return await contract.allowance(account, apiAddr);
    } catch (error) {
        console.log('getAllowance error: ', error);
        noticeError(error);
        throw error;
    }
};

export const approve = async ({ tokenAddr, amount = (1e50).toLocaleString('fullwide', { useGrouping: false }) }: { tokenAddr: string; amount?: string }) => {
    try {
        const contract = getContract('erc20', tokenAddr);
        const apiAddr = await CONTRACT_CONTROLLER.api();
        return (
            await contract.connect(signer).approve(apiAddr, amount, {
                type: 0,
            })
        ).wait();
    } catch (error) {
        console.log('approve error: ', error);
        noticeError(error);
        throw error;
    }
};

export const deposit = async ({ amount, appAddr }: { account: string; amount: string; tokenAddr: string; appAddr: string }) => {
    try {
        const apiAddr = await CONTRACT_CONTROLLER.api();
        const contract = getContract('api', apiAddr);
        return (
            await contract.connect(signer).depositBaseToken(ethers.utils.parseUnits(amount), appAddr, {
                type: 0,
            })
        ).wait();
    } catch (error) {
        console.log('deposit error: ', error);
        noticeError(error);
        throw error;
    }
};

export const getPaidAPPs = async (account: string) => {
    try {
        const Interface = new ethers.utils.Interface(CONTRACT_ABI['app']);
        const apiAddr = await CONTRACT_CONTROLLER.api();
        const apiContract = getContract('api', apiAddr);
        const apps = await apiContract.listPaidApp(account, 0, 1e15);
        const appContracts: string[] = apps[0];

        const calls: ContractCall[] = [
            ['name'],
            ['symbol'],
            ['appOwner'],
            ['totalCharged'],
            ['balanceOfWithAirdrop', [account]],
            ['frozenMap', [account]],
            ['forceWithdrawDelay'],
        ];

        const promises = lodash.flattenDepth(
            appContracts.map((a) => calls.map((c) => [a, Interface.encodeFunctionData(...c)])),
            1
        );

        const results: { returnData: ethers.utils.Result } = await MULTICALL.callStatic.aggregate(promises);

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
                    earnings: formatNumber(d[3][0], {
                        limit: 0,
                        decimal: 18,
                    }),
                    balance: formatNumber(d[4].total - d[4].airdrop_, {
                        limit: 0,
                        decimal: 18,
                    }),
                    airdrop: formatNumber(d[4].airdrop_, {
                        limit: 0,
                        decimal: 18,
                    }),
                    frozen: d[5][0].toString(),
                    forceWithdrawDelay: d[6][0].toString(),
                };
            });

        return data;
    } catch (error) {
        console.log('getPaidAPPs error: ', error);
        noticeError(error);
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
        noticeError(error);
        throw error;
    }
};

export const withdrawRequest = async (appAddr: string) => {
    try {
        return (await getContract('app', appAddr).connect(signer).withdrawRequest()).wait();
    } catch (error) {
        console.log('withdrawRequest error: ', error);
        noticeError(error);
        throw error;
    }
};

export const forceWithdraw = async (appAddr: string) => {
    try {
        return (await getContract('app', appAddr).connect(signer).forceWithdraw()).wait();
    } catch (error) {
        console.log('forceWithdraw error: ', error);
        noticeError(error);
        throw error;
    }
};

export const takeEarnings = async (appAddr: string, to: string, amount: string) => {
    try {
        return (await getContract('app', appAddr).connect(signer).takeProfit(to, ethers.utils.parseUnits(amount))).wait();
    } catch (error) {
        console.log('takeEarnings error: ', error);
        noticeError(error);
        throw error;
    }
};
