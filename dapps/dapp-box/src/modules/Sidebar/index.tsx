import React, { useCallback, useState } from 'react';
import { a, useSpring, config } from '@react-spring/web';
import cx from 'clsx';
import Logo from '@assets/logo.svg';
import Expand from '@assets/expand.svg';
import ShuttleFlow from '@assets/shuttle-flow.svg';
import CrossSpace from '@assets/cross-space.svg';
import './index.css';

const dapps = [{
    name: 'ShuttleFlow',
    icon: ShuttleFlow,
}, {
    name: 'cross-space',
    icon: CrossSpace,
}];

const Sidebar: React.FC = () => {
    const [expand, setExpand] = useState(false);
    const triggerExpand = useCallback(() => {
        setExpand(pre => !pre);
    }, []);

    const style = useSpring({
        width: expand ? 222 : 72,
        config: config.stiff,
    });

    return (
        <a.div className={'leftbar-container flex flex-col py-[16px] px-[8px] bg-white z-10 overflow-hidden'} style={style}>
            <img
                className={cx('self-end w-[24px] h-[24px] transition-transform cursor-pointer', { 'rotate-180': !expand })}
                alt="expand button"
                src={Expand}
                onClick={triggerExpand}
            />

            <div className='mt-[16px] ml-[9px] flex items-center text-[16px] text-black'>
                <img src={Logo} className='w-[38px] h-[38px]' alt="logo" />
                <span className={cx('ml-[12px] transition-opacity', expand ? 'opacity-100' : 'opacity-0')}>LOGO</span>
            </div>

            <p className='mt-[32px] mb-[8px] ml-[17.62px] text-[12px] leading-[16px] text-[#A9ABB2]'>App</p>

            {dapps.map((dapp, index) =>
                <div key={dapp.name} className={cx('', index !== 0 && 'mt-[12px]')}>
                    <img src={dapp.icon} className='w-[28px] h-[28px]' alt={`${dapp.name} icon`} />
                </div>
            )}
        </a.div>
    );
}

export default Sidebar;