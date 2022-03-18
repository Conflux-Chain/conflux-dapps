import React, { useCallback, useState } from 'react';
import { a, useSpring, config } from '@react-spring/web';
import cx from 'clsx';
import Popper from 'common/components/Popper';
import Logo from '@assets/logo.svg';
import Expand from '@assets/expand.svg';
import ShuttleFlow from '@assets/shuttle-flow.svg';
import CrossSpace from '@assets/cross-space.svg';
import './index.css';

const dapps = [
    {
        name: 'Shuttle Flow',
        icon: ShuttleFlow,
    },
    {
        name: 'Cross Space',
        icon: CrossSpace,
    },
];

const Sidebar: React.FC = () => {
    const [expand, setExpand] = useState(false);
    const triggerExpand = useCallback(() => {
        setExpand((pre) => !pre);
    }, []);

    const drawerStyle = useSpring({
        width: expand ? 222 : 72,
        config: config.stiff,
    });

    const textOpacityStyle = useSpring({
        opacity: expand ? 1 : 0,
        config: config.stiff,
    });

    const textTransformStyle = useSpring({
        x: expand ? 0 : 40,
        config: expand ? config.stiff : config.slow,
    });

    return (
        <a.div className={'leftbar-container flex flex-col py-[16px] px-[8px] bg-white z-10 overflow-hidden'} style={drawerStyle}>
            <img
                className={cx('self-end w-[24px] h-[24px] transition-transform cursor-pointer', { 'rotate-180': !expand })}
                alt="expand button"
                src={Expand}
                onClick={triggerExpand}
            />

            <div className="mt-[16px] ml-[9px] flex items-center">
                <img src={Logo} className="w-[38px] h-[38px]" alt="logo" />
                <a.span className="ml-[12px] text-[16px] text-black font-semibold" style={{ ...textOpacityStyle, ...textTransformStyle }}>
                    LOGO
                </a.span>
            </div>

            <p className="mt-[32px] mb-[8px] ml-[17.62px] text-[12px] leading-[16px] text-[#A9ABB2]">App</p>

            {dapps.map((dapp, index) => (
                <Popper
                    key={dapp.name}
                    Content={<DappTooltip name={dapp.name} />}
                    placement="right"
                    arrow={false}
                    delay={100}
                    offset={[0, 0]}
                    disabled={expand}
                    animationType='zoom'
                >
                    <div
                        className={cx(
                            'group flex items-center pl-[8px] h-[48px] rounded-[8px] transition-colors cursor-pointer',
                            index !== 0 && 'mt-[12px]',
                            expand && 'hover:bg-[#F5F7FF]'
                        )}
                    >
                        <div
                            className={cx(
                                'flex-shrink-0 inline-flex items-center justify-center w-[40px] h-[40px] rounded-[8px] transition-colors',
                                !expand && 'group-hover:bg-[#F5F7FF]'
                            )}
                        >
                            <img src={dapp.icon} className="w-[30px] h-[30px]" alt={`${dapp.name} icon`} />
                        </div>
                        <a.span
                            className="ml-[6px] text-[14px] text-[#A9ABB2] font-semibold whitespace-nowrap"
                            style={{ ...textOpacityStyle, ...textTransformStyle }}
                        >
                            {dapp.name}
                        </a.span>
                    </div>
                </Popper>
            ))}
        </a.div>
    );
};

const DappTooltip: React.FC<{ name: string }> = ({ name }) => {
    return <span className="inline-block px-[12px] h-[32px] rounded-[32px] leading-[32px] text-center text-[12px] text-white bg-[#6C89FB]">{name}</span>;
};

export default Sidebar;
