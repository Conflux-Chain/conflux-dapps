import { useEffect, useState } from 'react';
import { useChainId as useConfluxChainId } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { useChainId as useEthereumChainId, useStatus as useEthereumStatus } from '@cfx-kit/react-utils/dist/AccountManage';
import { useChainIdNative } from 'governance/src/store/lockDays&blockNumber';
import { spaceSeat } from 'common/conf/Networks';

export const isSameChainNativeWallet = () => {
    const [isSame, setIsSame] = useState(false);
    const chainIdNative = useChainIdNative();
    const confluxChainId = useConfluxChainId();
    const ethereumChainId = useEthereumChainId();
    const ethereumStatus = useEthereumStatus();
    const isEthereumActive = ethereumStatus === 'active';

    useEffect(() => {
        const chainId = chainIdNative === confluxChainId ? confluxChainId : chainIdNative === ethereumChainId ? ethereumChainId : '';

        if (!isEthereumActive && spaceSeat(chainIdNative) === 'eSpace') {
            setIsSame(false);
            return;
        }

        setIsSame(chainIdNative === chainId);
    }, [chainIdNative, confluxChainId, ethereumChainId, isEthereumActive]);

    return isSame;
};
