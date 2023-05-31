import { useSearchParams } from 'react-router-dom';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import cx from 'clsx';
import { useSpring, a } from '@react-spring/web';
import { setCurrentFromChain, useCurrentFromChain } from 'bsc-espace/src/store';
import { shortenAddress } from 'common/utils/addressUtils';
import LocalStorage from 'localstorage-enhance';
import { AuthEthereum } from 'common/modules/AuthConnectButton';
import MetaMask from 'common/assets/wallets/MetaMask.svg';
import Fluent from 'common/assets/wallets/Fluent.svg';
import { useIsMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';
import TurnPage from 'cross-space/src/assets/turn-page.svg';
import Input from 'common/components/Input';
import BalanceText from 'common/modules/BalanceText';
import { useAccount, useStatus, useChainId, Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useBalance, useMaxAvailableBalance, useNeedApprove, useToken, useCurrentFromNetwork, useCurrentToNetwork, setChain } from 'bsc-espace/src/store';
import ChainList from 'bsc-espace/src/components/ChainList';
import Config from 'bsc-espace/config';

const transitions = {
    en: {},
    zh: {},
} as const;

const Chain: React.FC<{
    account?: string;
    flipped: boolean;
    setAmount: (val: string) => void;
    handleCheckAmount: (evt: React.FocusEvent<HTMLInputElement, Element>) => Promise<void>;
    handleClickMax: () => void;
    receiveBalance: Unit | undefined;
    register: any;
}> = ({ account, flipped, setAmount, handleCheckAmount, handleClickMax, receiveBalance, register }) => {
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();
    const token = useToken();

    const metaMaskAccount = useAccount();
    const metaMaskStatus = useStatus();
    const metaMaskChainId = useChainId();
    const balance = useBalance();
    const maxAvailableBalance = useMaxAvailableBalance();
    const needApprove = useNeedApprove(token);
    const currentFromNetwork = useCurrentFromNetwork();
    const currentToNetwork = useCurrentToNetwork();
    const currentFromChain = useCurrentFromChain();

    useEffect(() => setAmount(''), [metaMaskAccount, token, metaMaskChainId]);

    const isBalanceGreaterThan0 = maxAvailableBalance && Unit.greaterThan(maxAvailableBalance, Unit.fromStandardUnit(0));

    return (
        <div className={cx(flipped && 'rotateX-180')}>
            <div className={cx('h-[96px] px-[12px] py-[10px] my-[16px] rounded-[8px] border-[1px] border-[#EAECEF] transition-transform duration-300 ')}>
                <div className="flex justify-between items-center mb-[11px]">
                    <Input
                        id="bsc-espace-deposit-amount-input"
                        className="border-none text-[#3D3F4C]"
                        placeholder="0"
                        type="number"
                        size="mini"
                        step={1e-18}
                        min={Unit.fromMinUnit(1).toDecimalStandardUnit()}
                        max={maxAvailableBalance?.toDecimalStandardUnit()}
                        disabled={!isBalanceGreaterThan0}
                        {...register('amount', {
                            required: !needApprove,
                            min: Unit.fromMinUnit(1).toDecimalStandardUnit(),
                            max: maxAvailableBalance?.toDecimalStandardUnit(),
                            onBlur: handleCheckAmount,
                        })}
                    />
                    <div className="flex items-center text-[16px] text-[#3D3F4C] font-medium whitespace-nowrap">
                        {currentFromChain !== 'crossChain' && (
                            <>
                                <img className="mr-[4px] w-[20px] h-[20px]" src={currentFromNetwork.logo} />
                                <span>{currentFromNetwork.network.chainName}</span>
                            </>
                        )}
                        {currentFromChain === 'crossChain' && <ChainList />}
                        {/* hide dropdown */}
                        {/* {currentFromChain === 'crossChain' && (
                            <>
                                <img className="mr-[4px] w-[20px] h-[20px]" src={currentFromNetwork.logo} />
                                <span>{currentFromNetwork.network.chainName}</span>
                            </>
                        )} */}
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="text-[14px] text-[#A9ABB2] font-normal">
                        Balance:
                        <BalanceText
                            className="ml-[4px]"
                            balance={balance}
                            id="wallet-balance"
                            symbol={token.symbol}
                            decimals={+token.decimals}
                            status={metaMaskStatus}
                        />
                        <button
                            id="eSpaceBridge-DepositAamount-max"
                            className="h-[18px] w-[34px] bg-[#F0F3FF] ml-[8px] rounded-[2px] text-[12px] text-[#808BE7] cursor-pointer"
                            onClick={handleClickMax}
                            disabled={!isBalanceGreaterThan0}
                            type="button"
                        >
                            MAX
                        </button>
                    </div>

                    <AuthEthereum
                        id={`bsc-espace-network-${currentFromNetwork.network.chainName}-auth-connect-button`}
                        className="w-fit"
                        reverse
                        size="mini"
                        connectTextType="concise"
                        showLogo
                        checkChainMatch={false}
                        network={currentFromNetwork.network}
                        authContent={() => (
                            <div className="relative flex items-center">
                                <img src={isMetaMaskHostedByFluent ? Fluent : MetaMask} alt="fluent icon" className="mr-[4px] w-[16px] h-[16px]" />
                                <span className="mr-[8px] text-[12px] text-[#3D3F4C]">{account ? shortenAddress(account!) : ''}</span>
                            </div>
                        )}
                    />
                </div>
            </div>
            <div className={cx('h-[96px] px-[12px] py-[10px] rounded-[8px] border-[1px] border-[#EAECEF] transition-transform duration-300 ')}>
                <div className="flex justify-between items-center mb-[11px]">
                    <BalanceText
                        className=" text-[#898D9A] text-[24px] font-medium"
                        id="will-receive"
                        balance={receiveBalance}
                        symbol={token.symbol}
                        decimals={+token.decimals}
                    />
                    <div className="flex items-center text-[16px] text-[#3D3F4C] font-medium whitespace-nowrap">
                        {currentFromChain === 'crossChain' && (
                            <>
                                <img className="mr-[4px] w-[20px] h-[20px]" src={currentToNetwork.logo} />
                                <span>{currentToNetwork.network.chainName}</span>
                            </>
                        )}
                        {currentFromChain !== 'crossChain' && <ChainList />}
                        {/* {currentFromChain !== 'crossChain' && (
                            <>
                                <img className="mr-[4px] w-[20px] h-[20px]" src={currentToNetwork.logo} />
                                <span>{currentToNetwork.network.chainName}</span>
                            </>
                        )} */}
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="text-[14px] text-[#A9ABB2] font-normal">receive</div>
                    <AuthEthereum
                        id={`bsc-espace-network-${currentToNetwork.network.chainName}-auth-connect-button`}
                        className="w-fit"
                        reverse
                        size="mini"
                        connectTextType="concise"
                        showLogo
                        checkChainMatch={false}
                        network={currentToNetwork.network}
                        authContent={() => (
                            <div className="relative flex items-center">
                                <img src={isMetaMaskHostedByFluent ? Fluent : MetaMask} alt="fluent icon" className="mr-[4px] w-[16px] h-[16px]" />
                                <span className="mr-[8px] text-[12px] text-[#3D3F4C]">{account ? shortenAddress(account!) : ''}</span>
                            </div>
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

const ChainSelect: React.FC<{
    setAmount: (val: string) => void;
    handleCheckAmount: (evt: React.FocusEvent<HTMLInputElement, Element>) => Promise<void>;
    handleClickMax: () => void;
    receiveBalance: Unit | undefined;
    register: any;
}> = ({ setAmount, handleCheckAmount, handleClickMax, receiveBalance, register }) => {
    const account = useAccount();

    const hasInit = useRef(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const initChainAndFlip = useCallback(() => {
        if (hasInit.current) return undefined;

        const sourceChain = searchParams.get('sourceChain');
        const destinationChain = searchParams.get('destinationChain');
        if (!sourceChain || !destinationChain) return undefined;
        if (sourceChain === 'Ethereum Classic' || destinationChain == 'Ethereum Classic') {
            setChain(Config.chains[1]);
        }

        const flip = sourceChain !== 'Conflux eSpace';
        LocalStorage.setItem({ key: 'flipped', data: flip, namespace: 'bsc-espace' });
        searchParams.delete('sourceChain');
        searchParams.delete('destinationChain');
        setTimeout(() => setSearchParams(searchParams));
        return flip;
    }, []);

    const [flipped, setFlipped] = useState(() => {
        if (searchParams.get('sourceChain')) {
            const flipRes = initChainAndFlip();
            if (typeof flipRes === 'boolean') return flipRes;
        } else if (window.location.hash.slice(1).indexOf('source=fluent-wallet') !== -1) {
            LocalStorage.setItem({ key: 'flipped', data: false, namespace: 'bsc-espace' });
            history.pushState('', document.title, window.location.pathname + window.location.search);
            return false;
        }
        return LocalStorage.getItem('flipped', 'bsc-espace') === true;
    });

    const style = useSpring({
        transform: `perspective(600px) rotateX(${flipped ? 180 : 0}deg)`,
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
        <a.div className="my-[16px] " style={style}>
            <Chain
                account={account}
                flipped={flipped}
                setAmount={setAmount}
                handleCheckAmount={handleCheckAmount}
                handleClickMax={handleClickMax}
                receiveBalance={receiveBalance}
                register={register}
            />
            <button
                id="bsc-espace-chain-flip"
                className="absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] rotate-90 turn-page flex justify-center items-center w-[28px] h-[28px] rounded-full bg-white cursor-pointer transition-transform hover:scale-105"
                type="button"
                onClick={handleClickFlipped}
            >
                <img src={TurnPage} alt="turn page" className={cx('w-[14px] h-[14px]')} draggable="false" />
            </button>
        </a.div>
    );
};

export default ChainSelect;
