import { store as fluentStore, provider as fluentProvider } from '@cfxjs/use-wallet';
import { provider as metaMaskProvider } from '@cfxjs/use-wallet/dist/ethereum';
import { validateBase32Address } from '@fluent-wallet/base32-address';
import { isHexAddress } from '@fluent-wallet/account';
import { confluxStore } from '@store/index';
import { format } from 'js-conflux-sdk';

import CRC20TokenABI from '@contracts/abi/ERC20.json';

function hexToAscii(hex: string) {
    let hexString = hex;
    let res = '';
    for (let i = 0, len = hex.length; i < len; i += 2) {
        res += String.fromCharCode(parseInt(hexString.substring(i, i + 2), 16));
    }
    return res.replace(/[\x00-\x1f]+/g, '').trim();
}

function hexToAddress(hex: string) {
    const chainId = fluentStore.getState().chainId!;
    return format.address('0x' + hex.slice(26), +chainId);
}

interface TokenContract {
    name(): Record<string, string>;
    symbol(): Record<string, string>;
    decimals(): Record<string, string>;
}

const tokenInfo = ['name', 'symbol', 'decimals'] as const;    

const judgeTokenValid = async (tokenAddress: string) => {
    const canCrossSpace = await judgeCanCrossSpace();

    const isHex = isHexAddress(tokenAddress);
    const isBase32 = validateBase32Address(tokenAddress);
    if (!isHex && !isBase32) return 'invalid address';
    const provider = isBase32 ? fluentProvider : metaMaskProvider;
    if (isBase32 && !provider) return 'need fluent install';
    if (isHex && !provider) 'need metamask install';

    try {
        const isCRC20Token = await judgeIsCRC20Token({ tokenAddress, provider, isBase32 });
        if (!isCRC20Token) return 'not CRC20 token';

        const canCrossSpace = await judgeCanCrossSpace();
        console.log(canCrossSpace)
    } catch (err) {
        console.error('judgeTokenValid: ', err);
    }
}

const judgeIsCRC20Token = async ({ tokenAddress, provider, isBase32 } : { tokenAddress: string; provider: typeof fluentProvider; isBase32: boolean; }) => {
    const conflux = confluxStore.getState().conflux!;
    const tokenContract = conflux.Contract({ abi: CRC20TokenABI, address: tokenAddress }) as unknown as TokenContract;
    
    try {
        const res = await Promise.all(tokenInfo.map(info => 
            provider!.request({
                method: `${isBase32 ? 'cfx' : 'eth'}_call`,
                params: [
                    {
                        data: tokenContract[info]().data,
                        to: tokenAddress
                    }, 
                    isBase32 ? 'latest_state' : 'latest'
                ]
            }),
        ));
        const [name, symbol] = res?.slice(0, 2).map(info => hexToAscii(info));
        const decimals = Number(res?.[2]);
        if (!name || !symbol || isNaN(decimals)) return false;
        return [name, symbol, decimals];
    } catch (err) {
        console.error(`address: ${tokenAddress} is not CRC20 token`, err);
        return false;
    }
}

const judgeCanCrossSpace = async () => {
    const { confluxSideContract, confluxSideContractAddress, evmSideContract, evmSideContractAddress } = confluxStore.getState()!;
    const targetToken = '0x8c759898b4B2CECB5454216AFb4779894dada47A';
    try {
        // const r2 = await fluentProvider!.request({
        //     method: `cfx_call`,
        //     params: [
        //         {
        //             data: confluxSideContract!.mappedTokens(targetToken).data,
        //             to: confluxSideContractAddress
        //         }, 
        //         'latest_state'
        //     ]
        // });
        // console.log('cSide sources', r2);
        // console.log(hexToAddress(r2))
        const r2 = await metaMaskProvider!.request({
            method: `cfx_call`,
            params: [
                {
                    data: evmSideContract!.mappedTokens(targetToken).data,
                    to: evmSideContractAddress
                }, 
                'latest'
            ]
        });
        console.log('cSide sources', r2);
        console.log(hexToAddress(r2))
    } catch (err) {
        console.log('cSide sources err', err);
    }

}

export default judgeTokenValid;