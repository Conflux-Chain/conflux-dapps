/// <reference types="vite/client" />

declare module '@fluent-wallet/estimate-tx' {
    export function estimate(txParams: any, options: any): Promise<{ nativeMaxDrip: string }>;
}

interface ImportMetaEnv {
    readonly VITE_POSADDRESS: string;
}
