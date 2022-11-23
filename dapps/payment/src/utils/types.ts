import { CONTRACT_ABI } from 'payment/src/contracts/constants';

export type APPType = '1' | '2';

export type ResourceMethodsType = 'name' | 'symbol' | 'appOwner' | 'totalCharged' | 'totalRequests' | 'listUser' | 'listResources';

export interface UsersDataSourceType {
    address: string;
    airdrop: string;
    balance: string;
}

export interface SResourceDataSourceType {
    index: number;
    id: string;
    name: string;
    description: string;
    price: string;
    duration: string;
    giveawayDuration: string;
    // props?: [string[], string[]];
    configurations: Array<{
        value: string;
        description: string;
    }>;
}

export interface APPCardResourceType {
    list: Array<SResourceDataSourceType>;
    total: number;
}

export interface ResourceDataSourceType {
    index: number;
    resourceId: string;
    weight: string;
    pendingWeight: string;
    requests: string;
    submitTimestamp: string;
    pendingSeconds: number;
    action?: string;
    op: number;
    pendingOP: string;
}

export interface DataSourceType {
    name: string;
    address: string;
    owner: string;
    earnings: string | number;
    balance: string | number;
    airdrop: string | number;
    forceWithdraw: string;
    withdrawSchedule: string;
    symbol: string;
    link: string;
    type: APPType;
}

export interface APPResourceType {
    list: Array<ResourceDataSourceType>;
    total: number;
}

export interface APPDetailType {
    name: string;
    symbol: string;
    link: string;
    address: string;
    description: string;
    type: number;
    deferTimeSecs: number;
}

export interface APPDataSourceType extends Omit<DataSourceType, 'address' | 'balance' | 'airdrop' | 'forceWithdrawDelay'> {
    requests: number;
    users: number;
    resources: APPResourceType;
}

export type DefinedContractNamesType = keyof typeof CONTRACT_ABI;

export interface PostAPPType {
    name: string;
    url: string;
    weight: number;
    account: string;
    symbol: string;
    description?: string;
    type: APPType;
}

export type CSVType = Array<Array<string>>;

export interface TitleType {
    text?: string;
    key?: string;
    link?: string;
    active?: boolean;
    onClick?: (key: Pick<TitleType, 'key' | 'text'>) => void;
}

export type ContractCall = [string, any[]?];
