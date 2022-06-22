import { store as fluentStore } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { validateCfxAddress, validateHexAddress, convertHexToCfx, convertCfxToHex } from 'common/utils/addressUtils';
import { Contracts, type Token } from 'cross-space/src/store/index';
import { mergeSearchToken } from './tokenListStore';
import Networks from 'common/conf/Networks';

function hexToAscii(hex: string) {
    let hexString = hex;
    let res = '';
    for (let i = 0, len = hex.length; i < len; i += 2) {
        res += String.fromCharCode(parseInt(hexString.substring(i, i + 2), 16));
    }
    return res.replace(/[\x00-\x1f]+/g, '').trim();
}

function hexToAddress(hex: string, isBase32: boolean) {
    console.log(hex, isBase32)
    const hexAddress = '0x' + hex.slice(26);
    if (isBase32) return hexAddress;
    const chainId = fluentStore.getState().chainId!;
    return convertHexToCfx(hexAddress, chainId);
}

const tokenInfo = ['name', 'symbol', 'decimals'] as const;    

const judgeAddressValid = async (tokenAddress: string) => {
    const isHex = validateHexAddress(tokenAddress);
    const isBase32 = validateCfxAddress(tokenAddress);
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
                icon: "https://conflux-static.oss-cn-beijing.aliyuncs.com/icons/default.png",
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
            icon: "https://conflux-static.oss-cn-beijing.aliyuncs.com/icons/default.png"
        } as unknown as Token;
        mergeSearchToken(token);
        return token
    } catch (err) {
        return false
    }
}

const judgeIsCRC20Token = async ({ tokenAddress, isBase32 } : { tokenAddress: string; isBase32: boolean; }) => {
    const tokenContract = Contracts.tokenContract!;
    const network = isBase32 ? Networks.core : Networks.eSpace;
    
    try {
        const res = await Promise.all(tokenInfo.map(info => 
            fetch(network.rpcUrls[0], {
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: `${isBase32 ? 'cfx' : 'eth'}_call`,
                    params: [{
                        data: tokenContract[info]().encodeABI(),
                        to: tokenAddress
                    }, isBase32 ? 'latest_state' : 'latest'],
                    id: 1,
                }),
                headers: {'content-type': 'application/json'},
                method: 'POST',
            })
                .then(response => response.json()).then(res => res?.result)
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
const judgeCanCrossSpace = async ({ tokenAddress: _tokenAddress, isBase32 } : { tokenAddress: string; isBase32: boolean; }) => {
    const tokenAddress = isBase32 ? convertCfxToHex(_tokenAddress) : _tokenAddress
    const networkCurrentSide = isBase32 ? Networks.core : Networks.eSpace;
    const contractCurrentSide = isBase32 ? Contracts.confluxSideContract : Contracts.evmSideContract!;
    const contractAddressCurrentSide = isBase32 ? Contracts.confluxSideContractAddressBase32 : Contracts.evmSideContractAddress;
    const networkAcrossSide = isBase32 ? Networks.eSpace : Networks.core;
    const contractAcrossSide = isBase32 ? Contracts.evmSideContract : Contracts.confluxSideContract;
    const contractAddressAcrossSide = isBase32 ? Contracts.evmSideContractAddress : Contracts.confluxSideContractAddressBase32;
    
    try {
        const [acrossSideRes, currentSideRes] = await Promise.all([
            fetch(networkAcrossSide.rpcUrls[0], {
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: `${isBase32 ? 'eth' : 'cfx'}_call`,
                    params: [{
                        data: contractAcrossSide.mappedTokens(tokenAddress).encodeABI(),
                        to: contractAddressAcrossSide
                    }, isBase32 ? 'latest' : 'latest_state'],
                    id: 1,
                }),
                headers: {'content-type': 'application/json'},
                method: 'POST',
            })
                .then(response => response.json()).then(res => res?.result),
            fetch(networkCurrentSide.rpcUrls[0], {
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        method: `${isBase32 ? 'cfx' : 'eth'}_call`,
                        params: [{
                            data: contractCurrentSide.sourceTokens(tokenAddress).encodeABI(),
                            to: contractAddressCurrentSide
                        }, isBase32 ? 'latest_state' : 'latest'],
                        id: 1,
                    }),
                    headers: {'content-type': 'application/json'},
                    method: 'POST',
                })
                    .then(response => response.json()).then(res => res?.result),
        ]);
        
        if (acrossSideRes === zeroAddress && currentSideRes === zeroAddress) return false;
        const acrossAddress = hexToAddress(acrossSideRes === zeroAddress ? currentSideRes : acrossSideRes, isBase32);
        return {
            mapped_address: currentSideRes === zeroAddress ? acrossAddress : _tokenAddress,
            native_address: currentSideRes === zeroAddress ? _tokenAddress : acrossAddress,
            nativeSpace: (isBase32 ? (currentSideRes === zeroAddress ? 'core' : 'eSpace') : (currentSideRes === zeroAddress ? 'eSpace' : 'core')) as 'core' | 'eSpace'
        }
    } catch (err) {
        console.error(`address: ${_tokenAddress} can't cross space`, err);
        return false;
    }

}

export default judgeAddressValid;