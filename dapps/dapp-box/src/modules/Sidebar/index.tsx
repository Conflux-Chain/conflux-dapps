import React, { useCallback, useState, Fragment } from 'react';
import { a, useSpring, useTrail, config } from '@react-spring/web';
import { useNavigate } from 'react-router-dom';
import cx from 'clsx';
import Popper from 'common/components/Popper';
import useCurrentDapp from 'hub/src/hooks/useCurrentDapp';
import ConfluxHub from 'hub/src/assets/ConfluxHub.svg';
import ConfluxHubText from 'hub/src/assets/ConfluxHub-text.svg';
import Expand from 'hub/src/assets/expand.svg';
import { dapps } from 'hub/src/App';
import { useNotSupportMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';
import './index.css';
import { useExpand, changeExpand } from './sideBarStore';

const dappsSupportMetaMaskHostedByFluent = ['eSpace Bridge', 'Governance', 'Web3 Paywall', 'Bridge', 'Pos', 'Native USDT0'];

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const currentDapp = useCurrentDapp();
    useNotSupportMetaMaskHostedByFluent(dappsSupportMetaMaskHostedByFluent.includes(currentDapp?.name) ? undefined : currentDapp?.name);

    const expand = useExpand();

    const triggerExpand = useCallback(() => {
        changeExpand();
    }, []);

    const isMobile = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    const drawerStyle = useSpring({
        width: expand ? (isMobile() ? 300 : 222) : isMobile() ? 0 : 72,
        config: config.stiff,
    });

    const textLeaveStyle = useSpring({
        x: expand ? 0 : 40,
        opacity: expand ? 1 : 0,
        config: config.gentle,
    });

    const textEnterStyles = useTrail(dapps.length + 1, {
        config: config.stiff,
        x: expand ? 0 : 40,
        opacity: expand ? 1 : 0,
    });

    return (
        <a.div
            className={cx(
                'leftbar-container flex-shrink-0 flex flex-col pb-[36px]  bg-white z-20 select-none h-[100vh] rounded-none',
                (expand || !isMobile()) && 'px-[8px]',
                isMobile() && 'absolute px-0 rounded-r-[12px]'
            )}
            style={drawerStyle}
        >
            <div className="relative flex items-center h-[64px]">
                <div className="ml-[12px] flex items-center overflow-hidden">
                    <img src={ConfluxHub} className="w-[32px] h-[32px] mr-[2px]" alt="logo" draggable="false" />
                    <a.img
                        src={ConfluxHubText}
                        className="w-[90px] h-[14px]"
                        alt="logo"
                        draggable="false"
                        style={expand ? textEnterStyles[0] : textLeaveStyle}
                    />
                </div>

                <div
                    className={cx(
                        'absolute top-[50%] -translate-y-[50%] expand-button flex items-center justify-center w-[24px] h-[24px] rounded-full bg-white transition-all cursor-pointer',
                        expand ? 'md:-right-[20px] right-[12px]' : '-right-[44px]',
                        !expand && isMobile() && 'hidden'
                    )}
                    onClick={triggerExpand}
                >
                    <img
                        className={cx('w-[14px] h-[14px] transition-transform', expand ? 'rotate-180' : 'rotate-0')}
                        alt="expand button"
                        src={Expand}
                        draggable="false"
                    />
                </div>
            </div>

            <div className={cx('mt-[32px] mb-[8px] ml-[17.62px] text-[12px] leading-[16px] text-[#A9ABB2] ', isMobile() && 'hidden')}>APP</div>
            {dapps
                .filter((dapp) => dapp.name !== 'ShuttleFlow')
                .map((dapp, index) => (
                    <Fragment key={dapp.name}>
                        {dapp.name === 'Pos' && (
                            <div
                                className={cx(
                                    'mt-[32px] mb-[8px] text-[12px] leading-[16px] text-[#A9ABB2]',
                                    expand ? 'ml-[17.62px]' : 'ml-[4px]',
                                    isMobile() && 'hidden'
                                )}
                            >
                                Advanced
                            </div>
                        )}
                        <Popper
                            Content={<DappTooltip name={dapp.name} />}
                            placement="right"
                            arrow={false}
                            delay={100}
                            offset={[0, 0]}
                            disabled={expand}
                            animationType="zoom"
                        >
                            <div className={cx('relative', !expand && isMobile() && 'hidden', { 'mt-[12px]': dapp.name !== 'Bridge' && dapp.name !== 'Pos' })}>
                                <div
                                    className={cx(
                                        'group items-center pl-[8px] h-[48px] rounded-[8px] transition-colors overflow-hidden contain-content flex',
                                        currentDapp.path === dapp.path && 'bg-[#F8F9FE]',
                                        expand && currentDapp.path !== dapp.path && 'hover:bg-[#F8F9FE] cursor-pointer'
                                    )}
                                    onClick={() => {
                                        if (currentDapp.path === dapp.path && dapp.name === 'Pos') return;
                                        navigate(dapp?.link ?? dapp.path);
                                    }}
                                >
                                    <div
                                        className={cx(
                                            'flex-shrink-0 inline-flex items-center justify-center w-[40px] h-[40px] rounded-[8px] transition-colors',
                                            currentDapp.path === dapp.path && 'bg-[#F8F9FE]',
                                            !expand && currentDapp.path !== dapp.path && 'group-hover:bg-[#F8F9FE] cursor-pointer'
                                        )}
                                    >
                                        <img src={dapp.icon} className="w-[30px] h-[30px]" alt={`${dapp.name} icon`} draggable="false" />
                                    </div>
                                    <a.span
                                        className={cx(
                                            'ml-[6px] text-[14px] font-semibold whitespace-nowrap transition-colors',
                                            currentDapp.path === dapp.path ? 'text-[#3D3F4C] ' : 'text-[#A9ABB2]'
                                        )}
                                        style={expand ? textEnterStyles[index + 1] : textLeaveStyle}
                                    >
                                        {dapp.name}
                                    </a.span>
                                </div>

                                <span
                                    className={cx(
                                        'absolute right-[-8px] top-[50%] -translate-y-[50%] w-[2px] h-[20px] bg-[#4C70FF] opacity-0 transition-opacity ',
                                        !expand && currentDapp.path === dapp.path && 'opacity-100'
                                    )}
                                />
                            </div>
                        </Popper>
                    </Fragment>
                ))}
        </a.div>
    );
};

const DappTooltip: React.FC<{ name: string }> = ({ name }) => {
    return <span className="inline-block px-[12px] h-[32px] rounded-[32px] leading-[32px] text-center text-[12px] text-white bg-[#6C89FB]">{name}</span>;
};

export default Sidebar;
