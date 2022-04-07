import React, { useEffect } from 'react';
import { Unit } from '@cfxjs/use-wallet/dist/ethereum';
import numFormat from 'common/utils/numFormat';
import NoClaimBg from 'bsc-espace/src/assets/no-claim-bg.png';
import { useDepositList, useDepositInFetching, useClaimingList } from './depositStore';
import CFXIcon from 'cross-space/src/assets/CFX.svg';
import { useESpaceNetwork, useCrossNetwork } from 'bsc-espace/src/store';
import useLoading from 'common/hooks/useLoading';
import AuthConnectButton from 'common/modules/AuthConnectButton';
import Spin from 'common/components/Spin';
import List from 'common/components/List';
import handleClaim from './handleClaim';
import './index.css';

const Auth: React.FC = () => {
    return (
        <AuthConnectButton
            className="mt-[8px] button-inline"
            id="claim-authConnect"
            wallet="MetaMask"
            buttonType="contained"
            buttonSize="normal"
            fullWidth
            connectTextType="concise"
            checkChainMatch={false}
            authContent={() => <Claim />}
        />
    );
};

const Claim: React.FC = () => {
    const eSpaceNetwork = useESpaceNetwork()!;
    const crossNetwork = useCrossNetwork()!;
    const inFetching = useDepositInFetching();
    const depositList = useDepositList();
    const claimingList = useClaimingList();
    const { setLoading, ref } = useLoading({ type: 'Spin', size: 68 });
    useEffect(() => {
        setLoading(inFetching);
    }, [inFetching]);
    
    if (!depositList?.length) {
        return (
            <div ref={ref}>
                <img className="w-full h-[228px]" src={NoClaimBg} alt="pending txn will appear here" />
            </div>
        );
    }

    return (
        <div ref={ref}>
            <List className="flex flex-col" list={depositList} itemKey="deposit_tx_hash" animatedSize ItemWrapperClassName="deposit-item">
                {(deposit) => (
                    <div
                        className="relative w-[432px] py-[12px] pl-[12px] pr-[132px] border-[1px] border-[#EAECEF] rounded-[4px] bg-[#FAFBFD]"
                        key={deposit.deposit_tx_hash}
                    >
                        <div className="flex items-center h-[22px] leading-[22px]">
                            <span className="text-[16px] text-[#3D3F4C] font-medium">
                                {numFormat(Unit.fromMinUnit(deposit?.amount ?? '0').toDecimalStandardUnit())}
                            </span>
                            <span className="ml-[8px] text-[14px] text-[#898D9A]">{deposit.token_abbr}</span>
                            <img className="ml-[8px] w-[18px] h-[18px]" src={CFXIcon} alt="token icon" />
                        </div>

                        <div className="mt-[8px] leading-[18px] text-[14px] text-[#A9ABB2]">
                            {`From ${deposit.src_chain_id === eSpaceNetwork.networkId ? eSpaceNetwork.name : crossNetwork.name} to ${
                                deposit.dest_chain_id === eSpaceNetwork.networkId ? eSpaceNetwork.name : crossNetwork.name
                            }`}
                        </div>

                        {(deposit.status !== 'WAIT_FOR_CLAIM' || claimingList?.includes(deposit.deposit_tx_hash)) && (
                            <button className="button button-outlined button-small absolute right-[16px] top-[50%] -translate-y-[50%] min-w-[60px]" disabled>
                                {deposit.status === 'CLAIMED' ? 'Claimed' : <Spin className="text-[#808BE7] text-[22px]" />}
                            </button>
                        )}
                        {deposit.status === 'WAIT_FOR_CLAIM' && !claimingList?.includes(deposit.deposit_tx_hash) && (
                            <AuthConnectButton
                                className="absolute right-[16px] top-[50%] -translate-y-[50%] min-w-[60px]"
                                id={`${deposit.deposit_tx_hash}-claim-auth`}
                                wallet="MetaMask"
                                buttonType="outlined"
                                buttonSize="small"
                                type="button"
                                useMetaMaskNetwork={deposit.dest_chain_id === eSpaceNetwork.networkId ? useESpaceNetwork : useCrossNetwork}
                                connectTextType="concise"
                                showLogo
                                logo={deposit.dest_chain_id === crossNetwork.networkId ? crossNetwork.logo : eSpaceNetwork.logo}
                                authContent={() => (
                                    <button
                                        className="absolute right-[16px] top-[50%] -translate-y-[50%] min-w-[60px] button-outlined button-small"
                                        onClick={() => handleClaim(deposit)}
                                    >
                                        <img
                                            className="mr-[4px] w-[14px] h-[14px]"
                                            src={deposit.dest_chain_id === crossNetwork.networkId ? crossNetwork.logo : eSpaceNetwork.logo}
                                            alt="chain logo"
                                        />
                                        Claim
                                    </button>
                                )}
                            />
                        )}
                    </div>
                )}
            </List>
        </div>
    );
};

export default Auth;
