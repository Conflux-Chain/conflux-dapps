import React, { useState, useCallback } from 'react';
import cx from 'clsx';
import { useSpring, a } from '@react-spring/web';
import { useAccount } from '@cfxjs/use-wallet/dist/ethereum';
import { useCrossNetwork, useESpaceNetwork, setCurrentFromChain } from 'bsc-espace/src/store';
import { shortenAddress } from '@fluent-wallet/shorten-address';
import LocalStorage from 'common/utils/LocalStorage';
import AuthConnectButton from 'common/modules/AuthConnectButton';
import MetaMask from 'common/assets/MetaMask.svg';
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
    const network = useNetwork();

    return (
        <div className={cx('flex flex-col justify-between w-[50%] h-[78px] px-[10px] py-[12px] rounded-[8px] border-[1px] border-[#EAECEF] transition-transform duration-300', flipped && 'rotateY-180')}>
            <AuthConnectButton
                className='w-fit'
                wallet="MetaMask"
                buttonType="contained"
                buttonReverse
                buttonSize="mini"
                connectTextType="concise"
                showLogo
                checkChainMatch={false}
                useMetaMaskNetwork={useNetwork}
                authContent={() => (
                    <div className="relative flex items-center">
                        <img src={MetaMask} alt="fluent icon" className="mr-[4px] w-[16px] h-[16px]" />
                        <span className="mr-[8px] text-[12px] text-[#3D3F4C]">{shortenAddress(account!)}</span>
                    </div>
                )}
            />
            <div className="flex items-center text-[14px] font-medium whitespace-nowrap">
                <img className="mr-[4px] w-[16px] h-[16px]" src={network.logo} />
                <span style={{ color: network.color }}>{network.name}</span>
            </div>
        </div>
    );
};

const ChainSelect: React.FC = () => {
    const account = useAccount();
    const [flipped, setFlipped] = useState(() => {
        const res = LocalStorage.get('flipped', 'bsc-espace') === true;
        setCurrentFromChain(res ? 'crossChain' : 'eSpace');
        return res;
    });

    const style = useSpring({
        transform: `perspective(600px) rotateY(${flipped ? 180 : 0}deg)`,
        config: { mass: 5, tension: 500, friction: 80, clamp: true },
    });

    const handleClickFlipped = useCallback(() => {
        setFlipped((pre) => {
            LocalStorage.set('flipped', !pre, 0, 'bsc-espace');
            setCurrentFromChain(!pre ? 'crossChain' : 'eSpace');
            return !pre;
        });
    }, []);

    return (
        <a.div className="mb-[16px] relative flex items-center gap-[12px]" style={style}>
            <Chain useNetwork={(useESpaceNetwork as unknown) as typeof useCrossNetwork} account={account} flipped={flipped} />
            <Chain useNetwork={useCrossNetwork} account={account} flipped={flipped} />
            <button
                id="bsc-espace-flip"
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
