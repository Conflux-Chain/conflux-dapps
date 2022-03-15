import { format } from 'js-conflux-sdk';
import { store as fluentStore, provider as fluentProvider } from '@cfxjs/use-wallet';
import { provider as metaMaskProvider } from '@cfxjs/use-wallet/dist/ethereum';
import { validateBase32Address } from '@fluent-wallet/base32-address';
import { isHexAddress } from '@fluent-wallet/account';
import { confluxStore, type Token } from '@store/index';
import { mergeSearchToken } from './tokenListStore';
import TokenDefaultIcon from '@assets/TokenDefaultIcon.png';
import CRC20TokenABI from '@contracts/abi/ERC20.json';

function hexToAscii(hex: string) {
    let hexString = hex;
    let res = '';
    for (let i = 0, len = hex.length; i < len; i += 2) {
        res += String.fromCharCode(parseInt(hexString.substring(i, i + 2), 16));
    }
    return res.replace(/[\x00-\x1f]+/g, '').trim();
}

function hexToAddress(hex: string, isBase32: boolean) {
    const hexAddress = '0x' + hex.slice(26);
    if (isBase32) return hexAddress;
    const chainId = fluentStore.getState().chainId!;
    return format.address(hexAddress, +chainId) as string;
}

interface TokenContract {
    name(): Record<string, string>;
    symbol(): Record<string, string>;
    decimals(): Record<string, string>;
}

const tokenInfo = ['name', 'symbol', 'decimals'] as const;    

const judgeAddressValid = async (tokenAddress: string) => {
    const isHex = isHexAddress(tokenAddress);
    const isBase32 = validateBase32Address(tokenAddress);
    if (!isHex && !isBase32) return false;

    try {
        const isCRC20Token = await judgeIsCRC20Token({ tokenAddress, isBase32 });
        if (!isCRC20Token) return false;

        const canCrossSpace = await judgeCanCrossSpace({ tokenAddress, isBase32 });

        if (!canCrossSpace) {
            return {
                core_space_name: isCRC20Token.name,
                core_space_symbol: isCRC20Token.symbol,
                evm_space_name: isCRC20Token.name,
                evm_space_symbol: isCRC20Token.symbol,
                decimals: isCRC20Token.decimals,
                icon: TokenDefaultIcon,
                native_address: tokenAddress
            } as unknown as Token;
        }

        const anotherAddress = isBase32 ? (canCrossSpace.nativeSpace === 'core' ? canCrossSpace.mapped_address : canCrossSpace.native_address)
            : (canCrossSpace.nativeSpace === 'core' ? canCrossSpace.native_address : canCrossSpace.mapped_address);
        const anotherSpaceInfo = await judgeIsCRC20Token({ tokenAddress: anotherAddress, isBase32: !isBase32 });
        if (!anotherSpaceInfo) return false;

        const token = {
            core_space_name: isBase32 ? isCRC20Token.name : anotherSpaceInfo.name,
            core_space_symbol: isBase32 ? isCRC20Token.symbol : anotherSpaceInfo.symbol,
            evm_space_name: isBase32 ? anotherSpaceInfo.name : isCRC20Token.name,
            evm_space_symbol: isBase32 ? anotherSpaceInfo.symbol : isCRC20Token.symbol,
            decimals: isCRC20Token.decimals,
            ...canCrossSpace,
            icon: TokenDefaultIcon
        } as unknown as Token;
        mergeSearchToken(token);
        return token
    } catch (err) {
        return false
    }
}

const judgeIsCRC20Token = async ({ tokenAddress, isBase32 } : { tokenAddress: string; isBase32: boolean; }) => {
    const conflux = confluxStore.getState().conflux!;
    const tokenContract = conflux.Contract({ abi: CRC20TokenABI, address: tokenAddress }) as unknown as TokenContract;
    const provider = isBase32 ? fluentProvider : metaMaskProvider;
    if (!conflux || !provider) return;
    
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
        return { name, symbol, decimals };
    } catch (err) {
        console.error(`address: ${tokenAddress} is not CRC20 token`, err);
        return false;
    }
}

const zeroAddress = '0x0000000000000000000000000000000000000000000000000000000000000000';
const judgeCanCrossSpace = async ({ tokenAddress, isBase32 } : { tokenAddress: string; isBase32: boolean; }) => {
    const providerCurrentSide = isBase32 ? fluentProvider : metaMaskProvider;
    const contractCurrentSide = isBase32 ? confluxStore.getState().confluxSideContract : confluxStore.getState().evmSideContract!;
    const contractAddressCurrentSide = isBase32 ? confluxStore.getState().confluxSideContractAddress : confluxStore.getState().evmSideContractAddress;
    const providerAcrossSide = isBase32 ? metaMaskProvider : fluentProvider;
    const contractAcrossSide = isBase32 ? confluxStore.getState().evmSideContract : confluxStore.getState().confluxSideContract;
    const contractAddressAcrossSide = isBase32 ? confluxStore.getState().evmSideContractAddress : confluxStore.getState().confluxSideContractAddress;
    if (!contractCurrentSide || !contractAcrossSide || !providerAcrossSide || !providerCurrentSide) return;

    try {
        const [acrossSideRes, currentSideRes] = await Promise.all([
            providerAcrossSide.request({
                method: `${isBase32 ? 'eth' : 'cfx'}_call`,
                params: [
                    {
                        data: contractAcrossSide.mappedTokens(tokenAddress).data,
                        to: contractAddressAcrossSide
                    }, 
                    isBase32 ? 'latest' : 'latest_state'
                ]
            }),
            providerCurrentSide.request({
                method: `${isBase32 ? 'cfx' : 'eth'}_call`,
                params: [
                    {
                        data: contractCurrentSide.sourceTokens(tokenAddress).data,
                        to: contractAddressCurrentSide
                    }, 
                    isBase32 ? 'latest_state' : 'latest'
                ]
            })
        ])
        if (acrossSideRes === zeroAddress && currentSideRes === zeroAddress) return false;
        const acrossAddress = hexToAddress(acrossSideRes === zeroAddress ? currentSideRes : acrossSideRes, isBase32);
        return {
            mapped_address: currentSideRes === zeroAddress ? acrossAddress : tokenAddress,
            native_address: currentSideRes === zeroAddress ? tokenAddress : acrossAddress,
            nativeSpace: (isBase32 ? (currentSideRes === zeroAddress ? 'core' : 'eSpace') : (currentSideRes === zeroAddress ? 'eSpace' : 'core')) as 'core' | 'eSpace'
        }
    } catch (err) {
        console.error(`address: ${tokenAddress} can't cross space`, err);
        return false;
    }

}

export default judgeAddressValid;