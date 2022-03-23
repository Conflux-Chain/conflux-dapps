import React, { useCallback, useState } from 'react';
import { a, useSpring, useTrail, config } from '@react-spring/web';
import { useNavigate } from 'react-router-dom';
import cx from 'clsx';
import Popper from 'common/components/Popper';
import useCurrentDapp from 'dapp-box/src/hooks/useCurrentDapp';
import ConfluxHub from 'dapp-box/src/assets/ConfluxHub.svg';
import ConfluxHubText from 'dapp-box/src/assets/ConfluxHub-text.svg';
import Expand from 'dapp-box/src/assets/expand.svg';
import { dapps } from 'dapp-box/src/App';
import './index.css';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const currentDapp = useCurrentDapp();

    const [expand, setExpand] = useState(() => {
        const last = (localStorage.getItem('drawer-expand') as 'true') || 'false';
        if (last === 'true' || last === 'false') return last === 'true';
        return false;
    });

    const triggerExpand = useCallback(() => {
        setExpand((pre) => {
            localStorage.setItem('drawer-expand', !pre ? 'true' : 'false');
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

    const advertStyle = useSpring({
        config: config.stiff,
        marginLeft: expand ? 12 : 0,
        width: expand ? 182 : 56,
        height: expand ? 182 : 56,
        borderRadius: expand ? 24 : 6,
        opacity: expand ? 1 : 0
    });

    return (
        <a.div className={'leftbar-container relative flex-shrink-0 flex flex-col px-[8px] pb-[36px] bg-white z-10 select-none'} style={drawerStyle}>
            <div className="relative flex items-center h-[64px]">
                <div className="ml-[12px] flex items-center overflow-hidden">
                    <img src={ConfluxHub} className="w-[32px] h-[32px] mr-[2px]" alt="logo" draggable="false" />
                    <a.img src={ConfluxHubText} className="w-[90px] h-[14px]" alt="logo" draggable="false" style={expand ? textEnterStyles[0] : textLeaveStyle}/>
                </div>

                <div
                    className={cx(
                        'absolute top-[50%] -translate-y-[50%] expand-button flex items-center justify-center w-[24px] h-[24px] rounded-full bg-white transition-transform cursor-pointer',
                        expand ? '-right-[20px] rotate-180' : '-right-[44px]'
                    )}
                    onClick={triggerExpand}
                >
                    <img className="w-[14px] h-[14px]" alt="expand button" src={Expand} draggable="false" />
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
                                onClick={() => navigate(dapp.path)}
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

            {
                <a.div
                    className='mt-auto bg-[#F5F7FF]'
                    style={advertStyle}
                >
                </a.div>
            }
        </a.div>
    );
};

const DappTooltip: React.FC<{ name: string }> = ({ name }) => {
    return <span className="inline-block px-[12px] h-[32px] rounded-[32px] leading-[32px] text-center text-[12px] text-white bg-[#6C89FB]">{name}</span>;
};

export default Sidebar;
