import { getContract, signer, formatNumber } from '.';
import {
    DataSourceType,
    PostAPPType,
    DefinedContractNamesType,
    APPCardResourceType,
    APPDetailType,
    // UsersDataSourceType,
    CSVType,
    ContractCall,
    APPResourceType,
    ResourceDataSourceType,
} from 'payment/src/utils/types';
import lodash, { defer } from 'lodash-es';
import { showToast } from 'common/components/showPopup/Toast';
import { ethers } from 'ethers';
import { CONTRACT_ABI } from 'payment/src/contracts/constants';
import { personalSign } from '@cfx-kit/react-utils/dist/AccountManage';
// @ts-ignore
import { binary_to_base58 } from 'base58-js';
import { ONE_DAY_SECONDS } from './constants';
import { processErrorMsg } from './index';
import BigNumber from 'bignumber.js';

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

const INTERFACE_APPV2 = new ethers.utils.Interface(CONTRACT_ABI['appv2']);
const INTERFACE_VIPCoin = new ethers.utils.Interface(CONTRACT_ABI['vipCoin']);
const CONTRACT_APPREGISTRY = getContract('appRegistry');
const MULTICALL = getContract('multicall');

const noticeError = (e: unknown) => {
    let msg = '';
    if (typeof e === 'string') {
        msg = e;
    } else if (typeof (e as ErrorType).message === 'string') {
        msg = (e as ErrorType).message;
    } else {
        msg = e as any;
    }
    msg = processErrorMsg(msg);
    console.log(msg);
    showToast(`Request failed, details: ${msg}`, { type: 'failed' });
};

const getAPPsRelatedContract = async (apps: string[]) => {
    try {
        const calls: ContractCall[] = [['getAppCoin'], ['getVipCoin'], ['getApiWeightToken'], ['cardShop']];
        const promises = lodash.flattenDepth(
            apps.map((app) => calls.map((c) => [app, INTERFACE_APPV2.encodeFunctionData(...c)])),
            1
        );
        const results: { returnData: ethers.utils.Result } = await MULTICALL.callStatic.aggregate(promises);
        const r: any = lodash
            .chunk(results.returnData, calls.length)
            .map((r) => r.map((d, i) => INTERFACE_APPV2.decodeFunctionResult(calls[i][0], d)))
            .map((d) => ({
                appCoin: d[0][0],
                vipCoin: d[1][0],
                apiWeightToken: d[2][0],
                cardShop: d[3][0],
            }));

        return r;
    } catch (error) {
        console.log('getAPPsRelatedContract error: ', error);
    }
};

export const getAPPsDetail = async (apps: string[]) => {
    try {
        // get APP related contract address
        const appInfos = await getAPPsRelatedContract(apps);

        // get APP link and payment type
        const callsAPP: ContractCall[] = [['link'], ['paymentType'], ['totalCharged'], ['totalTakenProfit'], ['description'], ['deferTimeSecs']];
        const promisesAPP = lodash.flattenDepth(
            apps.map((a: string) => callsAPP.map((c) => [a, INTERFACE_APPV2.encodeFunctionData(...c)])),
            1
        );

        // get APP name and symbol
        const callsVIPCoin: ContractCall[] = [['name'], ['symbol']];
        const promisesVIPCoin = lodash.flattenDepth(
            appInfos.map((a: any) => callsVIPCoin.map((c) => [a.vipCoin, INTERFACE_VIPCoin.encodeFunctionData(...c)])),
            1
        );

        // @ts-ignore
        const results: { returnData: ethers.utils.Result } = await MULTICALL.callStatic.aggregate([].concat(promisesAPP, promisesVIPCoin));

        const rAPP: any = lodash
            .chunk(results.returnData.slice(0, callsAPP.length * apps.length), callsAPP.length)
            .map((r) => r.map((d, i) => INTERFACE_APPV2.decodeFunctionResult(callsAPP[i][0], d)))
            .map((d, i) => ({
                address: apps[i],
                link: d[0][0],
                type: d[1][0], // 1 - billing, 2 - subscription
                earnings: formatNumber(d[2][0].sub(d[3][0]), {
                    limit: 0,
                    decimal: 18,
                }),
                description: d[4][0],
                deferTimeSecs: d[5][0], // withdraw delay period
            }));

        const rVIPCoin: any = lodash
            .chunk(results.returnData.slice(callsAPP.length * apps.length), callsVIPCoin.length)
            .map((r) => r.map((d, i) => INTERFACE_VIPCoin.decodeFunctionResult(callsVIPCoin[i][0], d)))
            .map((d, i) => ({
                name: d[0][0],
                symbol: d[1][0],
            }));

        return rAPP.map((r: any, i: number) => ({
            ...r,
            ...rVIPCoin[i],
        }));
    } catch (error) {
        console.log('getAPPsDetail error: ', error);
        return [];
    }
};

export const getAPPs = async (creator?: string): Promise<DataSourceType[]> => {
    try {
        // get APPs
        const method = creator ? 'listByOwner' : 'list';
        const args = creator ? [creator, 0, 1e8] : [0, 1e8];
        const apps = await CONTRACT_APPREGISTRY[method](...args);
        const appContracts = apps[1];
        return await getAPPsDetail(appContracts.map((app: any) => app.addr));
    } catch (error) {
        console.log('getAPPs error: ', error);
        noticeError(error);
        return [];
    }
};

export const getPaidAPPs = async (account: string) => {
    try {
        const r = await getContract('util').listAppByUser(account, 0, 1e8, {
            type: 0,
        });

        return {
            list: r.apps.map((a) => ({
                address: a.app,
                name: a.name,
                symbol: a.symbol,
                link: a.link,
                type: a.paymentType_,
                billing: {
                    airdrop: formatNumber(a.airdrop, {
                        limit: 0,
                        decimal: 18,
                    }),
                    balance: formatNumber(a.balance, {
                        limit: 0,
                        decimal: 18,
                    }),
                    deferTimeSecs: a.deferTimeSecs.toString(),
                    withdrawSchedule: a.withdrawSchedule.toString(),
                },
                subscription: {
                    name: a.vipCardName,
                    expired: Number(a.vipExpireAt.toString()),
                    cardShop: a.cardShop,
                },
            })),
            total: r.total,
        };
    } catch (error) {
        console.log('getPaidAPPs error: ', error);
        noticeError(error);
        throw error;
    }
};

export const postAPP = async ({ name, url, weight, description = '', symbol, account, type }: PostAPPType) => {
    try {
        await (
            await CONTRACT_APPREGISTRY.connect(signer).create(
                name,
                symbol,
                url,
                description,
                type,
                '3600',
                ethers.utils.parseUnits(String(weight || 0)),
                account,
                {
                    type: 0,
                }
            )
        ).wait();
    } catch (error) {
        console.log('postAPP error: ', error);
        noticeError(error);
        throw error;
    }
};

export const getAPP = async (address: string): Promise<APPDetailType> => {
    try {
        const detail = (await getAPPsDetail([address]))[0];

        return {
            name: '',
            link: '',
            address,
            symbol: '',
            description: '',
            type: 1,
            ...detail,
            deferTimeSecs: detail?.deferTimeSecs.toNumber() || 0,
        };
    } catch (error) {
        console.log('getAPP error: ', error);
        noticeError(error);
        return {
            name: '',
            link: '',
            address,
            symbol: '',
            description: '',
            type: 1,
            deferTimeSecs: 0,
        };
    }
};

export const getAPPAPIs = async (address: RequestProps['address']): Promise<APPResourceType> => {
    try {
        const appInfos = await getAPPsRelatedContract([address].map((app: any) => app));
        const contract = await getContract('apiWeightToken', appInfos[0].apiWeightToken);
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
        console.log('getAPPAPIs error: ', error);
        noticeError(error);
        return {
            list: [],
            total: 0,
        };
    }
};

export const configAPPAPI = async (address: RequestProps['address'], data: EditableAPI): Promise<any> => {
    try {
        const appInfos = await getAPPsRelatedContract([address].map((app: any) => app));
        return await (
            await getContract('apiWeightToken', appInfos[0].apiWeightToken)
                .connect(signer)
                .configResource([data.index, data.resourceId, ethers.utils.parseUnits(String(data.weight)), data.op])
        ).wait();
    } catch (error) {
        console.log('configAPPAPI: ', error);
        noticeError(error);
        throw error;
    }
};

export const deleteAPPAPI = async (address: RequestProps['address'], data: EditableAPI): Promise<any> => {
    try {
        const appInfos = await getAPPsRelatedContract([address].map((app: any) => app));
        return await (
            await getContract('apiWeightToken', appInfos[0].apiWeightToken)
                .connect(signer)
                .configResource([data.index, data.resourceId, ethers.utils.parseUnits(data.weight), data.op])
        ).wait();
    } catch (error) {
        console.log('deleteAPPAPI: ', error);
        noticeError(error);
        throw error;
    }
};

// export const getAPPUsers = async (
//     address: RequestProps['address']
// ): Promise<{
//     list: UsersDataSourceType[];
//     total: 0;
// }> => {
//     try {
//         const data = await getContract('appv2', address).listUser(0, 1e8);

//         let list = [];
//         const users = data[0];
//         const total = data[1];

//         if (users.length) {
//             const calls: ContractCall[] = users.map((u: { user: string }) => ['balanceOfWithAirdrop', [u.user]]);
//             const promises = calls.map((c) => [address, INTERFACE_APPV2.encodeFunctionData(...c)]);
//             const results: { returnData: ethers.utils.Result } = await MULTICALL.callStatic.aggregate(promises);
//             const r = results.returnData.map((d, i) => INTERFACE_APPV2.decodeFunctionResult(calls[i][0], d));

//             list = users.map((u: any, i: number) => ({
//                 address: u.user,
//                 balance: formatNumber(r[i].total.sub(r[i].airdrop_), {
//                     limit: 0,
//                     decimal: 18,
//                 }),
//                 airdrop: formatNumber(r[i].airdrop_, {
//                     limit: 0,
//                     decimal: 18,
//                 }),
//             }));
//         }

//         return {
//             list,
//             total,
//         };
//     } catch (error) {
//         console.log('getAPPUsers error: ', error);
//         noticeError(error);
//         return {
//             list: [],
//             total: 0,
//         };
//     }
// };

export const airdropBiiling = async (list: CSVType, address: string) => {
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
            await getContract('appv2', address)
                .connect(signer)
                .airdropBatch(...params, {
                    type: 0,
                })
        ).wait();
    } catch (error) {
        console.log('airdropBiiling error: ', error);
        noticeError(error);
        throw error;
    }
};

export const getAllowance = async ({ tokenAddr, appAddr }: { tokenAddr: string; appAddr: string }) => {
    try {
        const contract = getContract('erc20', tokenAddr);
        return await contract.allowance(await signer.getAddress(), appAddr);
    } catch (error) {
        console.log('getAllowance error: ', error);
        noticeError(error);
        throw error;
    }
};

export const approve = async ({
    tokenAddr,
    amount = (1e50).toLocaleString('fullwide', { useGrouping: false }),
    appAddr,
}: {
    tokenAddr: string;
    amount?: string;
    appAddr: string;
}) => {
    try {
        const contract = getContract('erc20', tokenAddr);
        return (
            await contract.connect(signer).approve(appAddr, amount, {
                type: 0,
            })
        ).wait();
    } catch (error) {
        console.log('approve error: ', error);
        noticeError(error);
        throw error;
    }
};

export const getAPIKey = async (appAddr: string) => {
    try {
        const msg = { domain: 'web3pay', contract: appAddr };
        const sig = await personalSign(JSON.stringify(msg));
        return binary_to_base58(ethers.utils.arrayify(sig));
    } catch (error) {
        console.log('getAPIKey error: ', error);
        noticeError(error);
        throw error;
    }
};

export const withdrawRequest = async (appAddr: string) => {
    try {
        return (await getContract('appv2', appAddr).connect(signer).requestForceWithdraw()).wait();
    } catch (error) {
        console.log('requestForceWithdraw error: ', error);
        noticeError(error);
        throw error;
    }
};

// card operation
export const getAPPCards = async (address: RequestProps['address']): Promise<APPCardResourceType> => {
    try {
        const contracts = await getAPPsRelatedContract([address].map((app: any) => app));
        const cardTemplate = await getContract('cardShop', contracts[0].cardShop).template();
        const cards = await getContract('cardShopTemplate', cardTemplate).list(0, 1e8);

        return {
            list: cards[0].map((c: any) => ({
                id: c.id.toString(),
                name: c.name,
                price: ethers.utils.formatUnits(c.price),
                duration: c.duration.div(ONE_DAY_SECONDS).toString(),
                giveawayDuration: c.giveawayDuration.div(ONE_DAY_SECONDS).toString(),
                description: c.description,
                configurations: c.props[0].map((_: any, i: number) => ({
                    value: c.props[0][i],
                    description: c.props[1][i],
                })),
            })),
            total: cards.total,
        };
    } catch (error) {
        console.log('getAPPCards error: ', error);
        noticeError(error);
        return {
            list: [],
            total: 0,
        };
    }
};

export const configAPPCard = async (address: RequestProps['address'], data: any): Promise<any> => {
    try {
        const contracts = await getAPPsRelatedContract([address].map((app: any) => app));
        const cardTemplate = await getContract('cardShop', contracts[0].cardShop).connect(signer).template();

        return await (
            await getContract('cardShopTemplate', cardTemplate)
                .connect(signer)
                .config({
                    ...data,
                    price: ethers.utils.parseUnits(String(data.price)),
                })
        ).wait();
    } catch (error) {
        console.log('configAPPCard error: ', error);
        noticeError(error);
        throw error;
    }
};

export const getAllowanceCard = async ({ tokenAddr, appAddr }: { tokenAddr: string; appAddr: string }) => {
    try {
        const contracts = await getAPPsRelatedContract([appAddr].map((app: any) => app));
        const contract = getContract('erc20', tokenAddr);
        return await contract.allowance(await signer.getAddress(), contracts[0].cardShop);
    } catch (error) {
        console.log('getAllowanceCard error: ', error);
        noticeError(error);
        throw error;
    }
};

export const approveCard = async ({
    tokenAddr,
    amount = (1e50).toLocaleString('fullwide', { useGrouping: false }),
    appAddr,
}: {
    tokenAddr: string;
    amount?: string;
    appAddr: string;
}) => {
    try {
        const contracts = await getAPPsRelatedContract([appAddr].map((app: any) => app));
        const contract = getContract('erc20', tokenAddr);
        return (
            await contract.connect(signer).approve(contracts[0].cardShop, amount, {
                type: 0,
            })
        ).wait();
    } catch (error) {
        console.log('approveCard error: ', error);
        noticeError(error);
        throw error;
    }
};

export const airdropCard = async (list: CSVType, appAddr: string, templateId: string) => {
    try {
        const params = list.reduce(
            (prev, curr) => {
                if (ethers.utils.isAddress(curr[0])) {
                    prev[0].push(curr[0]);
                    prev[1].push(ethers.BigNumber.from(curr[1]));
                }
                return prev;
            },
            [[], []] as Array<(string | ethers.BigNumber | number)[]>
        );

        const contracts = await getAPPsRelatedContract([appAddr].map((app: any) => app));

        return (
            await getContract('cardShop', contracts[0].cardShop)
                .connect(signer)
                .giveCardBatch(...params, templateId, {
                    type: 0,
                })
        ).wait();
    } catch (error) {
        console.log('airdropCard error: ', error);
        noticeError(error);
        throw error;
    }
};

export const getAPPRefundStatus = async (appAddr: string, account: string) => {
    try {
        const calls = [['deferTimeSecs'], ['withdrawSchedules', [account]]];

        // @ts-ignore
        const results: { returnData: ethers.utils.Result } = await MULTICALL.callStatic.aggregate(
            calls.map((c) => [appAddr, INTERFACE_APPV2.encodeFunctionData(...c)])
        );

        const rAPP: any = results.returnData.map((r, i) => INTERFACE_APPV2.decodeFunctionResult(calls[i][0], r)).map((d) => d.toString());

        return {
            deferTimeSecs: rAPP[0].toString(),
            withdrawSchedules: rAPP[1].toString(),
        };
    } catch (error) {
        console.log('getAPPRefundStatus error: ', error);
        noticeError(error);
        throw error;
    }
};

export const getMaxCFXInOfExactAPPCoin = async (amount: number | string) => {
    try {
        const exchange = await CONTRACT_APPREGISTRY.getExchanger();
        const CFXAmount = await getContract('exchange', exchange).previewDepositETH(ethers.utils.parseUnits(String(amount)));
        return ethers.utils.formatUnits(CFXAmount);
    } catch (error) {
        console.log('getMaxCFXInOfExactAPPCoin error: ', error);
        noticeError(error);
        throw error;
    }
};

export const getMinCFXOutOfExactAPPCoin = async (amount: number | string) => {
    try {
        const exchange = await CONTRACT_APPREGISTRY.getExchanger();
        const CFXAmount = await getContract('exchange', exchange).previewWithdrawETH(ethers.utils.parseUnits(String(amount)));
        return ethers.utils.formatUnits(CFXAmount);
    } catch (error) {
        console.log('getMinCFXOutOfExactAPPCoin error: ', error);
        noticeError(error);
        throw error;
    }
};

// deposit billing app with USDT
export const deposit = async ({ amount, appAddr }: { amount: string; appAddr: string }) => {
    try {
        const contract = getContract('appv2', appAddr);
        return (
            await contract.connect(signer).depositAsset(ethers.utils.parseUnits(amount), await signer.getAddress(), {
                type: 0,
            })
        ).wait();
    } catch (error) {
        console.log('deposit error: ', error);
        noticeError(error);
        throw error;
    }
};

// deposit billing app with CFX
export const depositCFX = async ({ amount, appAddr, value, tolerance }: { amount: string; value: string; appAddr: string; tolerance: number }) => {
    try {
        const exchange = await CONTRACT_APPREGISTRY.getExchanger();
        const maxValue = new BigNumber(value).multipliedBy(1 + tolerance).toFixed(18);
        return (
            await getContract('exchange', exchange)
                .connect(signer)
                .depositAppETH(appAddr, ethers.utils.parseUnits(amount), await signer.getAddress(), {
                    type: 0,
                    value: ethers.utils.parseUnits(maxValue),
                })
        ).wait();
    } catch (error) {
        console.log('depositCFX error: ', error);
        noticeError(error);
        throw error;
    }
};

// purchase subscription app with USDT
export const purchaseSubscription = async ({ amount, appAddr, templateId }: { amount: string | number; appAddr: string; templateId: string }) => {
    try {
        const contracts = await getAPPsRelatedContract([appAddr].map((app: any) => app));
        const r = await (
            await getContract('cardShop', contracts[0].cardShop)
                .connect(signer)
                .buyWithAsset(await signer.getAddress(), templateId, amount)
        ).wait();
        return r;
    } catch (error) {
        console.log('purchaseSubscription error: ', error);
        noticeError(error);
        throw error;
    }
};

// purchase subscription app with CFX
export const purchaseSubscriptionCFX = async ({
    amount,
    appAddr,
    value,
    templateId,
    tolerance,
}: {
    amount: string | number;
    value: string;
    appAddr: string;
    templateId: string;
    tolerance: number;
}) => {
    try {
        const contracts = await getAPPsRelatedContract([appAddr].map((app: any) => app));
        const maxValue = new BigNumber(value).multipliedBy(1 + tolerance).toFixed(18);
        const r = await (
            await getContract('cardShop', contracts[0].cardShop)
                .connect(signer)
                .buyWithEth(await signer.getAddress(), templateId, amount, {
                    type: 0,
                    value: ethers.utils.parseUnits(maxValue),
                })
        ).wait();
        return r;
    } catch (error) {
        console.log('purchaseSubscriptionCFX error: ', error);
        noticeError(error);
        throw error;
    }
};

// provider take earnings with USDT
export const takeEarnings = async ({ appAddr, receiver, amount }: { appAddr: string; receiver: string; amount: string }) => {
    try {
        return (await getContract('appv2', appAddr).connect(signer).takeProfit(receiver, ethers.utils.parseUnits(amount))).wait();
    } catch (error) {
        console.log('takeEarnings error: ', error);
        noticeError(error);
        throw error;
    }
};

// provider take earnings with CFX
export const takeEarningsCFX = async ({
    appAddr,
    receiver,
    amount,
    value,
    tolerance,
}: {
    appAddr: string;
    receiver: string;
    amount: string;
    value: string;
    tolerance: number;
}) => {
    try {
        // use latest calculation result
        const cfxValue = await getMinCFXOutOfExactAPPCoin(amount);
        const minValue = new BigNumber(cfxValue).multipliedBy(1 - tolerance).toFixed(18); // need params 18, otherwise will ocurr exceeds decimal error

        return (
            await getContract('appv2', appAddr).connect(signer).takeProfitAsEth(ethers.utils.parseUnits(amount), ethers.utils.parseUnits(minValue), {
                type: 0,
            })
        ).wait();
    } catch (error) {
        console.log('takeEarningsCFX error: ', error);
        noticeError(error);
        throw error;
    }
};

// consumer withdraw with USDT
export const forceWithdraw = async (appAddr: string) => {
    try {
        return (
            await getContract('appv2', appAddr)
                .connect(signer)
                .forceWithdraw(await signer.getAddress(), true)
        ).wait();
    } catch (error) {
        console.log('forceWithdraw error: ', error);
        noticeError(error);
        throw error;
    }
};

// consumer withdraw with CFX
export const forceWithdrawCFX = async ({ appAddr, amount, value, tolerance }: { appAddr: string; amount: string; value: string; tolerance: number }) => {
    try {
        const appv2 = getContract('appv2', appAddr).connect(signer);
        const account = await signer.getAddress();
        const exchange = await CONTRACT_APPREGISTRY.getExchanger();
        // use latest appcoin balance of account
        const balance = (await appv2.balanceOf(account)).coins;
        const cfxValue = await getMinCFXOutOfExactAPPCoin(ethers.utils.formatUnits(balance));
        const minValue = new BigNumber(cfxValue).multipliedBy(1 - tolerance).toFixed(18);

        return (
            await getContract('appv2', appAddr).connect(signer).forceWithdrawEth(account, exchange, ethers.utils.parseUnits(minValue), {
                type: 0,
            })
        ).wait();
    } catch (error) {
        console.log('forceWithdraw error: ', error);
        noticeError(error);
        throw error;
    }
};

export const updateAPPInfo = async ({
    appAddr,
    link,
    description,
    deferTimeSecs,
}: {
    appAddr: string;
    link: string;
    description: string;
    deferTimeSecs: number;
}) => {
    try {
        return (await getContract('appv2', appAddr).connect(signer).setAppInfo(link, description, deferTimeSecs)).wait();
    } catch (error) {
        console.log('forceWithdraw error: ', error);
        noticeError(error);
        throw error;
    }
};
