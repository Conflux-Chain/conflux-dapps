import { CONTRACT_ADDRESSES } from 'payment/src/contracts/constants'

export interface DataSourceType {
    name: string;
    baseURL: string;
    address: string;
    owner: string;
    earnings: string | number;
}

export type DefinedContractNamesType = keyof typeof CONTRACT_ADDRESSES

export interface PostAPPType {
    name: string;
    url: string;
    weight: number;
    account: string;
}