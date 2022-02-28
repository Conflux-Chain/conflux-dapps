declare module '@fluent-wallet/shorten-address' {
    export function shortenAddress(address: string): string;
}

declare module 'js-conflux-sdk/src/contract/internal/index.js' {
    export const CrossSpaceCall: { abi: Array<Object>; address: string; };
}

declare module '@fluent-wallet/base32-address' {
    export function validateBase32Address(address: string): boolean;
}

declare module '@fluent-wallet/account' {
    export function isHexAddress(address: string): string;
}

declare module '@fluent-wallet/estimate-tx' {
    export function estimate(txParams: any, options: any): Promise<{ nativeMaxDrip: string; }>;
}
