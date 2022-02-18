import React, { useState, useCallback } from 'react';
import { useSpring } from '@react-spring/web';
import useI18n from 'ui/hooks/useI18n';
import Core2ESpace from './Core2ESpace'
import './index.css';

const transitions = {
    en: {
        transfer_assets: 'Transfer Assets',
        between_space: 'Between Conflux Core and Conflux eSpace.',
    },
    zh: {
        transfer_assets: '转移资产',
        between_space: '在 Conflux Core 和 Conflux eSpace 之间。',
    },
} as const;

const Apps: React.FC = () => {
    const i18n = useI18n(transitions);

    const [flipped, setFlipped] = useState(() => {
        return false;
        if (window.location.hash.slice(1).indexOf('source=fluent-wallet') !== -1) {
            localStorage.setItem('filpped', 'false');
            history.pushState('', document.title, window.location.pathname + window.location.search);
            return false;
        }
        return localStorage.getItem('filpped') === 'true';
    });

    const { transform, opacity } = useSpring({
        opacity: flipped ? 1 : 0,
        transform: `perspective(600px) rotateX(${flipped ? 180 : 0}deg)`,
        config: { mass: 5, tension: 500, friction: 80, clamp: true },
    });

    const handleClickFlipped = useCallback(
        () =>
            setFlipped((pre) => {
                localStorage.setItem('filpped', !pre ? 'true' : 'false');
                return !pre;
            }),
        []
    );

    return (
        <div className="relative w-[480px] m-auto pt-[16px] mb-24px">
            <p className="pl-[32px] font-medium	text-[28px] leading-[36px] text-[#3D3F4C]">{i18n.transfer_assets}</p>
            <p className="pl-[32px] text-[16px] leading-[22px] mt-[4px] text-[#A9ABB2]">{i18n.between_space}</p>

            <div className='mt-[24px] h-[726px]'>
                <Core2ESpace
                    style={{
                        zIndex: flipped ? 0 : 1,
                        opacity: opacity.to(o => 1 - o),
                        transform,
                    }}
                    handleClickFlipped={handleClickFlipped}
                />
            </div>
        </div>
    );
};

export default Apps;
