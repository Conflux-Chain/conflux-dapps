import React, { useState, useCallback, useEffect } from 'react';
import { useSpring } from '@react-spring/web';
import useI18n from 'common/hooks/useI18n';
import LocalStorage from 'localstorage-enhance';
import Core2ESpace from './Core2ESpace';
import ESpace2Core from './ESpace2Core';
import { startSub } from 'cross-space/src/store';
import { completeDetect as completeDetectConflux } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { completeDetect as completeDetectEthereum } from '@cfxjs/use-wallet-react/ethereum';
import { useMetaMaskHostedByFluentRqPermissions } from 'common/hooks/useMetaMaskHostedByFluent';
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

    useEffect(() => {
        let unsub: undefined | (() => void);
        Promise.all([completeDetectConflux(), completeDetectEthereum()])
            .then(() => unsub = startSub());
            
        return () => {
            if (typeof unsub === 'function') {
                unsub();
            }
        }
    }, []);
    useMetaMaskHostedByFluentRqPermissions();

    const [flipped, setFlipped] = useState(() => {
        if (window.location.hash.slice(1).indexOf('source=fluent-wallet') !== -1) {
            LocalStorage.setItem({ key: 'flipped', data: false, namespace: 'cross-space'});
            history.pushState('', document.title, window.location.pathname + window.location.search);
            return false;
        }
        return LocalStorage.getItem('flipped', 'cross-space') === true;
    });

    const { transform, opacity } = useSpring({
        opacity: flipped ? 1 : 0,
        transform: `perspective(600px) rotateY(${flipped ? 180 : 0}deg)`,
        config: { mass: 5, tension: 500, friction: 80, clamp: true },
    });

    const handleClickFlipped = useCallback(() => {
        setFlipped((pre) => {
            LocalStorage.setItem({ key: 'flipped', data: !pre, namespace: 'cross-space'});
            return !pre;
        });
    }, []);

    return (
        <div className="relative w-[480px] mx-auto pt-[16px] mb-24px">
            <p className="pl-[32px] font-medium	text-[28px] leading-[36px] text-[#3D3F4C]">{i18n.transfer_assets}</p>
            <p className="pl-[32px] text-[16px] leading-[22px] mt-[4px] text-[#A9ABB2]">{i18n.between_space}</p>

            <div className='mt-[24px] h-[726px]'>
                <Core2ESpace
                    style={{
                        zIndex: flipped ? 0 : 1,
                        opacity: opacity.to(o => 1 - o),
                        transform,
                    }}
                    isShow={!flipped}
                    handleClickFlipped={handleClickFlipped}
                />
                <ESpace2Core
                    style={{
                        zIndex: flipped ? 1 : 0,
                        opacity,
                        transform,
                        rotateY: '180deg',
                    }}
                    isShow={flipped}
                    handleClickFlipped={handleClickFlipped}
                />
            </div>
        </div>
    );
};

export default Apps;
