import React, { useEffect } from 'react';
import useI18n from 'common/hooks/useI18n';
import ConnectTip from './ConnectTip';
import ClaimableList from './ClaimableList/index';
import { AuthESpaceAndCore } from 'common/modules/AuthConnectButton';
import { startTrack } from 'airdrop/src/store';

const transitions = {
    en: {
        espace_airdrop: 'Conflux eSpace Airdrop',
        description: `Conflux eSpace projects will get liquidity incentives from the Conflux Foundation by issuing airdrops to Conflux PoS stakers.`,
        click_here: 'Check here to stake CFX: ',
    },
    zh: {
        espace_airdrop: 'Conflux eSpace 空投',
        description: `Conflux eSpace项目将从Conflux基金会获得流动性激励，向Conflux PoS订户发放空投。
        在此查看CFX的股权。Conflux PoS验证人`,
        click_here: '点击这里质押 CFX:',
    },
} as const;

const App: React.FC = () => {
    const i18n = useI18n(transitions);
    useEffect(startTrack, []);

    return (
        <div className="relative max-w-[1000px] mx-auto pt-[16px] mb-24px">
            <div className="font-medium text-[28px] leading-[36px] text-[#3D3F4C]">{i18n.espace_airdrop}</div>
            <div className="text-[16px] leading-[22px] mt-[12px] text-[#A9ABB2]">{i18n.description}</div>
            <div className="text-[16px] leading-[22px] mt-[4px] text-[#A9ABB2]">
                {i18n.click_here}
                <a className="text-[#808BE7] hover:underline" href="https://conflux-pos-validators.org/" rel="" target="_blank">Conflux PoS Validators</a>
            </div>

            <ConnectTip />

            <div className="mt-[40px] mb-[16px] flex items-center h-[24px] text-[16px] text-[#3D3F4C] font-medium">
                Claimable Tokens
            </div>
            <AuthESpaceAndCore
                size="large"
                type="button"
                authContent={() => <ClaimableList />}
            />
        </div>
    );
};

export default App;
