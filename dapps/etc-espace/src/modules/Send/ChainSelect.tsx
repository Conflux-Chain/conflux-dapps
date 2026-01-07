import React, { useState, useCallback } from 'react';
import cx from 'clsx';
import { useSpring, a } from '@react-spring/web';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { useCrossNetwork, useESpaceNetwork, setCurrentFromChain } from 'etc-espace/src/store';
import { shortenAddress } from 'common/utils/addressUtils';
import LocalStorage from 'localstorage-enhance';
import { AuthEthereum } from 'common/modules/AuthConnectButton';
import MetaMask from 'common/assets/wallets/MetaMask.svg';
import Fluent from 'common/assets/wallets/Fluent.svg';
import { useIsMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';
import TurnPage from 'cross-space/src/assets/turn-page.svg';

const transitions = {
    en: {},
    zh: {},
} as const;

const Chain: React.FC<{ useNetwork: typeof useCrossNetwork; account?: string; flipped: boolean }> = ({
    useNetwork,
    account,
    flipped,
}) => {
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();
    const { network, logo, color } = useNetwork();

    return (
        <div className={cx('flex flex-col justify-between w-[50%] h-[78px] px-[10px] py-[12px] rounded-[8px] border-[1px] border-[#EAECEF] transition-transform duration-300', flipped && 'rotateY-180')}>
            <AuthEthereum
                id={`bsc-espace-network-${network.chainName}-auth-connect-button`}
                className='w-fit'
                reverse
                size="mini"
                connectTextType="concise"
                showLogo
                checkChainMatch={false}
                network={network}
                authContent={() => (
                    <div className="relative flex items-center">
                        <img src={isMetaMaskHostedByFluent ? Fluent : MetaMask} alt="fluent icon" className="mr-[4px] w-[16px] h-[16px]" />
                        <span className="mr-[8px] text-[12px] text-[#3D3F4C]">{account ? shortenAddress(account!) : ''}</span>
                    </div>
                )}
            />
            <div className="flex items-center text-[14px] font-medium whitespace-nowrap">
                <img className="mr-[4px] w-[16px] h-[16px]" src={logo} />
                <span style={{ color }}>{network.chainName}</span>
            </div>
        </div>
    );
};

const ChainSelect: React.FC = () => {
    const account = useAccount();
    const [flipped, setFlipped] = useState(() => {
        const res = LocalStorage.getItem('flipped', 'bsc-espace') === true;
        setCurrentFromChain(res ? 'crossChain' : 'eSpace');
        return res;
    });

    const style = useSpring({
        transform: `perspective(600px) rotateY(${flipped ? 180 : 0}deg)`,
        config: { mass: 5, tension: 500, friction: 80, clamp: true },
    });

    const handleClickFlipped = useCallback(() => {
        setFlipped((pre) => {
            LocalStorage.setItem({ key: 'flipped', data: !pre, namespace: 'bsc-espace' });
            setCurrentFromChain(!pre ? 'crossChain' : 'eSpace');
            return !pre;
        });
    }, []);

    return (
        <a.div className="mb-[16px] relative flex items-center gap-[12px]" style={style}>
            <Chain useNetwork={(useESpaceNetwork as unknown) as typeof useCrossNetwork} account={account} flipped={flipped} />
            <Chain useNetwork={useCrossNetwork} account={account} flipped={flipped} />
            <button
                id="bsc-espace-chain-flip"
                className="absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] turn-page flex justify-center items-center w-[28px] h-[28px] rounded-full bg-white cursor-pointer transition-transform hover:scale-105"
                type="button"
                onClick={handleClickFlipped}
            >
                <img src={TurnPage} alt="turn page" className={cx('w-[14px] h-[14px]')} draggable="false" />
            </button>
        </a.div>
    );
};

export default ChainSelect;
