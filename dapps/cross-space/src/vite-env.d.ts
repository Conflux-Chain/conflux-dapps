/// <reference types="vite/client" />

declare module '@fluent-wallet/estimate-tx' {
    export function estimate(txParams: any, options: any): Promise<{ nativeMaxDrip: string; }>;
}
