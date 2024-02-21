import { useEffect, useState } from 'react';
import { store as confluxStore, useStatus as useStatueFluent } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { store as ethereumStore, useStatus as useStatueEthereum } from '@cfxjs/use-wallet-react/ethereum';
import { useChainIdNative } from 'governance/src/store/lockDays&blockNumber';
import { spaceSeat } from 'common/conf/Networks';

export const isSameChainNativeWallet = () => {
    const [isSame, setIsSame] = useState(false);
    const chainIdNative = useChainIdNative();
    const confluxChainId = confluxStore.getState().chainId;
    const ethereumChainId = ethereumStore.getState().chainId;
    const isEthereumActive = useStatueEthereum() === 'active';
    const notInstalledEthereum =  useStatueEthereum() === 'not-installed';
    const notInstalledFluent = useStatueFluent() === 'not-installed';

    useEffect(() => {
        const chainId = chainIdNative === confluxChainId ? confluxChainId : chainIdNative === ethereumChainId ? ethereumChainId : '';

        // if (notInstalledEthereum && notInstalledFluent) {
        //     setIsSame(true);
        //     return;
        // }
        if (!isEthereumActive && spaceSeat(chainIdNative) === 'eSpace') {
            setIsSame(false);
            return;
        }

        setIsSame(chainIdNative === chainId);
    },[chainIdNative, confluxChainId, ethereumChainId])

    return isSame;
}

export const isESpace = () => {
    const chainIdNative = useChainIdNative();
    return spaceSeat(chainIdNative) === 'eSpace';
}