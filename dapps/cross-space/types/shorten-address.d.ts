declare module '@fluent-wallet/shorten-address' {
    export function shortenAddress(address: string): string;
}

declare module 'js-conflux-sdk/src/contract/internal/index.js' {
    export const CrossSpaceCall: { abi: Array<Object>; address: string; };
}

declare module '@fluent-wallet/estimate-tx' {
    export const estimate: any;
}