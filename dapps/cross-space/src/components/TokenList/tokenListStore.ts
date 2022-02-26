import create from 'zustand';
import { provider as fluentProvider } from '@cfxjs/use-wallet';
import { provider as metaMaskProvider } from '@cfxjs/use-wallet/dist/ethereum';
import { validateBase32Address } from '@fluent-wallet/base32-address';
import { isHexAddress } from '@fluent-wallet/account';
import LocalStorage from 'common/utils/LocalStorage';
import { nativeToken, type Token, currentNetworkStore, type Network } from '@store/index';
import { confluxStore } from '@store/index';
import CRC20TokenABI from '@contracts/abi/ERC20.json';
import NetworkConfig from '../../../network-config.json';

interface TokenListStore {
    tokenList: Array<Token>;
    getInnerTokenList: (confluxNetwork: Network) => Promise<void>;
}

type FetchRes = { core_native_tokens: Array<Token>; evm_native_tokens: Array<Token>; };

const tokenListStore = create<TokenListStore>((set) => ({
    tokenList: [nativeToken],
    getInnerTokenList: async (confluxNetwork: Network) => {
        try {
            const fetchUrl = NetworkConfig[confluxNetwork.networkId as '1'].innerTokenList;      
            if (!fetchUrl) return;  
            const fetchRes: FetchRes = await fetch(fetchUrl).then(data => data.json());
            set({ tokenList: mergeFetchList(fetchRes, confluxNetwork.networkId) });
        } catch (err) {
            console.error('fetch inner tokenList error: ', err);
        }
    }
}));

const mergeFetchList = (fetchRes: FetchRes, networkId: string) => {
    const fetchedTokenList = [...fetchRes?.core_native_tokens, ...fetchRes?.evm_native_tokens]
        .map(token => ({
            ...token,
            nativeSpace: token.native_address.startsWith('0x') ? 'eSpace' : 'core'
        }) as Token);

    const mergeRes = [nativeToken, ...fetchedTokenList];
    LocalStorage.set(`network${networkId}-innerTokenList`, mergeRes, 0, 'cross-space');
    return mergeRes;
}

currentNetworkStore.subscribe(state => state.core, (confluxNetwork) => {
    if (!confluxNetwork || !NetworkConfig[confluxNetwork.networkId as '1']) return;
    tokenListStore.setState({ tokenList: LocalStorage.get(`network${confluxNetwork.networkId}-innerTokenList`, 'cross-space') as Array<Token> ?? [nativeToken] });
    tokenListStore.getState().getInnerTokenList(confluxNetwork);
}, { fireImmediately: true });


export const judgeTokenCanCrossSpace = async (tokenAddress: string = '0x3BeFD75acf84665e0D6D5c7E7Ddd225F93A9FDd5') => {
    const isHex = isHexAddress(tokenAddress);
    const isBase32 = validateBase32Address(tokenAddress);
    if (!isHex && !isBase32) return;
    const conflux = confluxStore.getState().conflux;
    const provider = isBase32 ? fluentProvider : metaMaskProvider;
    if (!provider || !conflux) return;
    const tokenContract = conflux.Contract({ abi: CRC20TokenABI, address: tokenAddress });
    console.log(tokenContract);
    try {
        const name = await provider!.request({
            method: `${isBase32 ? 'cfx' : 'eth'}_call`,
            params: [
                {
                    data: tokenContract.symbol(),
                    to: tokenAddress
                }, 
                isBase32 ? 'latest_state' : 'latest'
            ]
        });
        console.log(name);
    } catch (err) {
        console.error('judgeTokenCanCrossSpace: ', err);
    }
}


const tokenListSelector = (state: TokenListStore) => state.tokenList;
export const useTokenList = () => tokenListStore(tokenListSelector);