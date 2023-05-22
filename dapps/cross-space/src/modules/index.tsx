import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSpring } from '@react-spring/web';
import useI18n from 'common/hooks/useI18n';
import LocalStorage from 'localstorage-enhance';
import Core2ESpace from './Core2ESpace';
import ESpace2Core from './ESpace2Core';
import { escapeRegExp } from 'lodash-es';
import { useTokenList } from 'cross-space/src/components/TokenList/tokenListStore';
import { startSub, setCurrentToken } from 'cross-space/src/store';
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
        Promise.all([completeDetectConflux(), completeDetectEthereum()]).then(() => (unsub = startSub()));

        return () => {
            if (typeof unsub === 'function') {
                unsub();
            }
        };
    }, []);
    useMetaMaskHostedByFluentRqPermissions();

    const hasInit = useRef(false);
    const tokenList = useTokenList();
    const [searchParams, setSearchParams] = useSearchParams();
    const initTokenAndFlip = useCallback(() => {
        if (hasInit.current) return undefined;

        const sourceChain = searchParams.get('sourceChain');
        if (!sourceChain) return undefined;
        if (tokenList) {
            hasInit.current = true;
            const flip = sourceChain !== 'Conflux Core';
            LocalStorage.setItem({ key: 'flipped', data: flip, namespace: 'cross-space' });

            const token = searchParams.get('token');
            const targetToken = token
                ? tokenList?.find(
                      (tokenData) =>
                          tokenData.core_space_symbol.search(new RegExp(escapeRegExp(token), 'i')) !== -1 ||
                          tokenData.evm_space_symbol.search(new RegExp(escapeRegExp(token), 'i')) !== -1
                  )
                : null;
            searchParams.delete('sourceChain');
            searchParams.delete('destinationChain');
            searchParams.delete('token');
            setTimeout(() => setSearchParams(searchParams));
            if (!targetToken) return flip;
            setCurrentToken(targetToken);
            return flip;
        }
        return undefined;
    }, [tokenList]);

    const [flipped, setFlipped] = useState(() => {
        if (searchParams.get('sourceChain')) {
            const flipRes = initTokenAndFlip();
            if (typeof flipRes === 'boolean') return flipRes;
        } else if (window.location.hash.slice(1).indexOf('source=fluent-wallet') !== -1) {
            LocalStorage.setItem({ key: 'flipped', data: false, namespace: 'cross-space' });
            history.pushState('', document.title, window.location.pathname + window.location.search);
            return false;
        }
        return LocalStorage.getItem('flipped', 'cross-space') === true;
    });

    useEffect(() => {
        const flipRes = initTokenAndFlip();
        if (typeof flipRes === 'boolean') {
            setFlipped(flipRes);
        }
    }, [tokenList]);

    const { transform, opacity } = useSpring({
        opacity: flipped ? 1 : 0,
        transform: `perspective(600px) rotateX(${flipped ? 180 : 0}deg)`,
        config: { mass: 5, tension: 500, friction: 80, clamp: true },
    });

    const handleClickFlipped = useCallback(() => {
        setFlipped((pre) => {
            LocalStorage.setItem({ key: 'flipped', data: !pre, namespace: 'cross-space' });
            return !pre;
        });
    }, []);

    return (
        <div className="relative md:w-[480px] w-[360px] mx-auto pt-[16px] mb-[24px]">
            <div className="pl-[10px] md:pl-[32px] font-medium text-[28px] leading-[36px] text-[#3D3F4C]">{i18n.transfer_assets}</div>
            <div className="pl-[10px] md:pl-[32px] text-[16px] leading-[22px] mt-[4px] text-[#A9ABB2]">{i18n.between_space}</div>

            <div className="mt-[24px] h-[726px] scale-75 md:scale-100 origin-top-left">
                <Core2ESpace
                    style={{
                        zIndex: flipped ? 0 : 1,
                        opacity: opacity.to((o) => 1 - o),
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
                        rotateX: '180deg',
                    }}
                    isShow={!!flipped}
                    handleClickFlipped={handleClickFlipped}
                />
            </div>
        </div>
    );
};

export default Apps;
