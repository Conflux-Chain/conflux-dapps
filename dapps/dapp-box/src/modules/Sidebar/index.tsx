import React, { useCallback, useState } from 'react';
import { a, useSpring, useTrail, config } from '@react-spring/web';
import { useNavigate } from 'react-router-dom';
import cx from 'clsx';
import Popper from 'common/components/Popper';
import useCurrentDapp from 'hub/src/hooks/useCurrentDapp';
import ConfluxHub from 'hub/src/assets/ConfluxHub.svg';
import ConfluxHubText from 'hub/src/assets/ConfluxHub-text.svg';
import Expand from 'hub/src/assets/expand.svg';
import { dapps } from 'hub/src/App';
import AdvertBg from 'hub/src/assets/advert.png';
import ArrowRight from 'hub/src/assets/arrow-right.svg';
import Explore from 'hub/src/assets/explore.svg';
import Close from 'common/assets/icons/close.svg';
import { useNotSupportMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';
import './index.css';

const dappsSupportMetaMaskHostedByFluent = ['eSpace Bridge', 'Governance', 'Web3 Paywall', 'Pos'];

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const currentDapp = useCurrentDapp();
    useNotSupportMetaMaskHostedByFluent(dappsSupportMetaMaskHostedByFluent.includes(currentDapp?.name) ? undefined : currentDapp?.name);

    const [expand, setExpand] = useState(() => {
        const last = (localStorage.getItem('ConfluxHub-drawer-expand') as 'true') || 'false';
        if (last === 'true' || last === 'false') return last === 'true';
        return true;
    });

    const triggerExpand = useCallback(() => {
        setExpand((pre) => {
            localStorage.setItem('ConfluxHub-drawer-expand', !pre ? 'true' : 'false');
            return !pre;
        });
    }, []);

    const drawerStyle = useSpring({
        width: expand ? 222 : 72,
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

    const [isExploreOpen, setExploreOpen] = useState(() => {
        const last = (localStorage.getItem('ConfluxHub-explore-open') as 'true') || 'true';
        if (last === 'true' || last === 'false') return last === 'true';
        return true;
    });
    const triggerExploreOpen = useCallback<React.MouseEventHandler>(() => {
        setExploreOpen((pre) => {
            localStorage.setItem('ConfluxHub-explore-open', !pre ? 'true' : 'false');
            return !pre;
        });
    }, []);

    const exploreStyle = useSpring({
        config: config.stiff,
        scale: expand ? 0 : 1,
        x: '-50%',
        opacity: expand ? 0 : 1,
    });

    const advertStyle = useSpring({
        config: config.stiff,
        x: expand ? 12 : isExploreOpen ? 80 : 0,
        scale: expand ? 1 : isExploreOpen ? 1 : 0.3,
        opacity: expand ? 1 : isExploreOpen ? 1 : 0,
    });

    return (
        <a.div className={'leftbar-container relative flex-shrink-0 flex flex-col px-[8px] pb-[36px] bg-white z-10 select-none'} style={drawerStyle}>
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
                        expand ? '-right-[20px]' : '-right-[44px]'
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

            <p className="mt-[32px] mb-[8px] ml-[17.62px] text-[12px] leading-[16px] text-[#A9ABB2]">APP</p>

            <div className="flex flex-col gap-[12px]">
                {dapps.map((dapp, index) => (
                    <Popper
                        key={dapp.name}
                        Content={<DappTooltip name={dapp.name} />}
                        placement="right"
                        arrow={false}
                        delay={100}
                        offset={[0, 0]}
                        disabled={expand}
                        animationType="zoom"
                    >
                        <div className="relative">
                            <div
                                className={cx(
                                    'group flex items-center pl-[8px] h-[48px] rounded-[8px] transition-colors overflow-hidden contain-content',
                                    currentDapp.path === dapp.path && 'bg-[#F8F9FE]',
                                    expand && currentDapp.path !== dapp.path && 'hover:bg-[#F8F9FE] cursor-pointer'
                                )}
                                onClick={() => navigate(dapp?.link ?? dapp.path)}
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
                                    'absolute right-[-8px] top-[50%] -translate-y-[50%] w-[2px] h-[20px] bg-[#4C70FF] opacity-0 transition-opacity',
                                    !expand && currentDapp.path === dapp.path && 'opacity-100'
                                )}
                            />
                        </div>
                    </Popper>
                ))}
            </div>

            <a.div
                className="advert absolute bottom-[32px] w-[182px] h-[182px] rounded-[24px] pt-[60px] px-[6px] font-normal text-center overflow-hidden contain-strict origin-bottom-left"
                style={advertStyle}
            >
                <img className="absolute -top-[2.5%] left-0 w-full" src={AdvertBg} alt="background image" draggable="false" />
                <img
                    className={cx(
                        'absolute top-[8px] right-[8px] w-[20px] h-[20px] cursor-pointer hover:scale-110 transition-all duration-200',
                        expand ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    )}
                    src={Close}
                    alt="close icon"
                    draggable="false"
                    onClick={triggerExploreOpen}
                />
                <p className="text-[14px] leading-[18px] text-[#4D71FF] translate-x-0">Directly from Ethereum to Conflux eSpace, Multichain is recommended</p>
                <a
                    className="mt-[16px] group inline-flex items-center justify-center w-[120px] h-[32px] rounded-[48px] leading-[32px] text-[12px] text-white bg-[#4D71FF] translate-x-0"
                    href="https://app.multichain.org/#/router"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    learn more
                    <img
                        className="ml-[4px] inline-block w-[18px] h-[18px] translate-y-[3px] group-hover:translate-x-[4px] transition-transform"
                        src={ArrowRight}
                        alt="arrow"
                    />
                </a>
            </a.div>

            <a.div
                className={cx(
                    'absolute bottom-[32px] w-[40px] h-[40px] rounded-[8px] flex justify-center items-center left-[50%] cursor-pointer contain-strict transition-colors',
                    expand && 'pointer-events-none',
                    isExploreOpen && 'bg-[#F8F9FE]'
                )}
                style={exploreStyle}
                onClick={triggerExploreOpen}
            >
                <span
                    className={cx(
                        'absolute left-[30px] top-[6px] flex w-[6px] h-[6px] transition-opacity duration-300',
                        isExploreOpen ? 'opacity-0' : 'opacity-100'
                    )}
                >
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E96170] opacity-75"></span>
                    <span className="relative inline-flex rounded-full w-[6px] h-[6px] bg-[#E96170]"></span>
                </span>
                <img className="w-[24px] h-[24px]" src={Explore} alt="explore" draggable="false" />
            </a.div>
        </a.div>
    );
};

const DappTooltip: React.FC<{ name: string }> = ({ name }) => {
    return <span className="inline-block px-[12px] h-[32px] rounded-[32px] leading-[32px] text-center text-[12px] text-white bg-[#6C89FB]">{name}</span>;
};

export default Sidebar;
