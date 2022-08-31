import { CONTRACT_ABI } from 'payment/src/contracts/constants';

export type ResourceMethodsType = 'name' | 'symbol' | 'appOwner' | 'totalCharged' | 'totalRequests' | 'listUser' | 'listResources';

export interface UsersDataSourceType {
    address: string;
    airdrop: string;
    balance: string;
}

export interface ResourceDataSourceType {
    resourceId: string;
    weight: string;
    requests: string;
    submitTimestamp: string;
    action?: string;
}

export interface DataSourceType {
    name: string;
    baseURL: string;
    address: string;
    owner: string;
    earnings: string | number;
    balance: string | number;
    airdrop: string | number;
    frozen: string;
    forceWithdrawDelay: string;
}

export interface APPDataSourceType extends Omit<DataSourceType, 'address' | 'balance' | 'airdrop' | 'frozen' | 'forceWithdrawDelay'> {
    requests: number;
    users: number;
    resources: {
        list: Array<ResourceDataSourceType>;
        total: number;
    };
}

export type DefinedContractNamesType = keyof typeof CONTRACT_ABI;

export interface PostAPPType {
    name: string;
    url: string;
    weight: number;
    account: string;
}

export type CSVType = Array<Array<string>>;

export interface TitleType {
    text: string;
    link?: string;
    active?: boolean;
}

export type ContractCall = [string, any[]?];
