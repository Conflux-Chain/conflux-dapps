import { useEffect, useState } from 'react';
import { store as confluxStore} from '@cfxjs/use-wallet-react/conflux/Fluent';
import { store as ethereumStore, useStatus as useStatueEthereum } from '@cfxjs/use-wallet-react/ethereum';
import { useChainIdNative } from 'governance/src/store/lockDays&blockNumber';
import { spaceSeat } from 'common/conf/Networks';

export const isSameChainNativeWallet = () => {
    const [isSame, setIsSame] = useState(false);
    const chainIdNative = useChainIdNative();
    const confluxChainId = confluxStore.getState().chainId;
    const ethereumChainId = ethereumStore.getState().chainId;
    const isEthereumActive = useStatueEthereum() === 'active';

    useEffect(() => {
        const chainId = chainIdNative === confluxChainId ? confluxChainId : chainIdNative === ethereumChainId ? ethereumChainId : '';

        if (!isEthereumActive && spaceSeat(chainIdNative) === 'eSpace') {
            setIsSame(false);
            return;
        }

        setIsSame(chainIdNative === chainId);
    },[chainIdNative, confluxChainId, ethereumChainId])

    return isSame;
}