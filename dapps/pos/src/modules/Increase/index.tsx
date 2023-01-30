import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'react-router-dom';
import { useAccount as useConfluxAccount } from '@cfxjs/use-wallet-react/conflux/Fluent';
import Cell from 'governance/src/components/Cell';
import { AuthCoreSpace } from 'common/modules/AuthConnectButton';
import Button from 'common/components/Button';
import Input from 'common/components/Input';
import InputMAXSuffix from 'common/components/Input/suffixes/MAX';
import TextPrefix from 'common/components/Input/suffixes/TextPrefix';
import { shortenHexString } from 'common/utils/addressUtils';
import EstimateAPI from '../../assets/estimateAPI.svg';
import PendingUnstaked from '../../assets/pendingUnstaked.svg';
import stakedPos from '../../assets/stakedPos.svg';
import BoundedPosIcon from 'pos/src/assets/boundedPos.svg';
import { usePosAccount, useLockedVotes, useTotalInterest, useInterestRatePos, useHistory, useMaxCanLockVotes, useRevocableVotes } from 'pos/src/store';
import { handleStake, handleUnstake } from './handleStakeAndUnstake';

const EstimatedAPITipContent: React.FC = () => {
    return (
        <div className="text-[14px] leading-[18px] text-[#898D9A]">
            The estimated APY is based on the number of staked votes in the entire network and changes in real time.
        </div>
    );
};

const CumulativeEarningsTipContent: React.FC = () => {
    return (
        <div className="text-[14px] leading-[18px] text-[#898D9A]">
            4% annualized interest of the old version is contained in the total accumulated interest of the current wallet address
        </div>
    );
};

export const PosInfoPanel: React.FC = () => {
    const posAccount = usePosAccount();
    const lockedVotes = useLockedVotes();
    const interestRatePos = useInterestRatePos();
    const totalInterest = useTotalInterest();
    const { state } = useLocation();
    const isWaitBoundConfirm = state?.status === 'wait-bound-confirm';

    return (
        <div className="grid grid-cols grid-cols-4 gap-[24px] mb-6">
            <Cell
                title="Bound PoS address"
                icon={BoundedPosIcon}
                Content={<div className="text-[#808BE7]">{posAccount ? shortenHexString(posAccount) : isWaitBoundConfirm ? 'Waiting Confirm...': 'Unbound'}</div>}
            />
            <Cell title="Staked in PoS" icon={stakedPos} Content={<span>{lockedVotes} Votes</span>} />
            <Cell title="Cumulative earnings" icon={PendingUnstaked} Content={<span>{totalInterest} CFX</span>} TipContent={CumulativeEarningsTipContent} />
            <Cell title="Estimated APY" icon={EstimateAPI} Content={<span>{interestRatePos}</span>} TipContent={EstimatedAPITipContent} />
        </div>
    );
};

const PosStakePanel: React.FC = () => {
    const account = useConfluxAccount();
    const maxCanLockVotes = useMaxCanLockVotes();
    const revocableVotes = useRevocableVotes();

    const { register: registerStake, handleSubmit: withStakeForm, setValue: setStakeValue } = useForm();
    const onStakeSubmit = useCallback(
        withStakeForm(async (data) => {
            const { stakeVotes } = data;
            await handleStake({ stakeVotes });
            setStakeValue('stakeVotes', '');
        }),
        []
    );

    const { register: registerUnstake, handleSubmit: withUnstakeForm, setValue: setUnstakeValue } = useForm();
    const onUnstakeSubmit = useCallback(
        withUnstakeForm(async (data) => {
            const { unstakeVotes } = data;
            await handleUnstake({ unstakeVotes });
            setUnstakeValue('unstakeVotes', '');
        }),
        []
    );

    useEffect(() => {
        setStakeValue('stakeVotes', '');
        setUnstakeValue('unstakeVotes', '');
    }, [account]);

    return (
        <div className="mb-[24px] flex flex-row p-[24px] gap-x-[24px] bg-white rounded-[8px]">
            <AuthCoreSpace
                id="pos-stakeAndUnstake-auth"
                size="large"
                type="button"
                authContent={() => (
                    <>
                        <form onSubmit={onStakeSubmit}>
                            <div className="mb-[12px] font-medium">Amount to stake</div>
                            <div className="flex items-center gap-x-[16px]">
                                <Input
                                    id="staked-votes"
                                    className="!w-[428px]"
                                    {...registerStake('stakeVotes', {
                                        required: true,
                                        min: 1,
                                        max: maxCanLockVotes ?? 0,
                                    })}
                                    disabled={!maxCanLockVotes || maxCanLockVotes < 1}
                                    min={1}
                                    max={maxCanLockVotes ?? 0}
                                    type="number"
                                    step={1}
                                    suffix={[<InputMAXSuffix id="governance-stake-max" />, <TextPrefix text="Votes" />]}
                                />

                                <Button size="large" disabled={!maxCanLockVotes || maxCanLockVotes < 1}>
                                    Stake
                                </Button>
                            </div>
                            <div className="flex justify-between items-center mt-[8px]">
                                <div className="">
                                    <div className="text-14px text-[#898D9A]">
                                        Stakable: <span className="text-[#3D3F4C]">{maxCanLockVotes ?? 0}</span>
                                    </div>
                                    <div className="mt-[8px] text-[12px] text-[#3D3F4C]">1 vote = 1,000 CFX</div>
                                </div>
                                <Link to="/governance/dashboard" className="no-underline">
                                    <Button className="w-[82px] h-[32px]" variant="outlined" size="small">
                                        Get more
                                    </Button>
                                </Link>
                            </div>
                        </form>
                        <form onSubmit={onUnstakeSubmit}>
                            <div className="mb-[12px] font-medium">Amount to unstake</div>
                            <div className="flex items-center gap-x-[16px]">
                                <Input
                                    id="unstaked-votes"
                                    className="!w-[428px]"
                                    {...registerUnstake('unstakeVotes', {
                                        required: true,
                                        min: 1,
                                        max: revocableVotes ?? 0,
                                    })}
                                    disabled={!revocableVotes || revocableVotes < 1}
                                    min={1}
                                    max={revocableVotes ?? 0}
                                    type="number"
                                    step={1}
                                    suffix={[<InputMAXSuffix id="governance-stake-max" />, <TextPrefix text="Votes" />]}
                                />

                                <Button size="large" disabled={!revocableVotes || revocableVotes < 1}>
                                    Unstake
                                </Button>
                            </div>
                            <div className="mt-2">
                                <span className="text-[#898D9A]">
                                    Unstakable: <span className="text-[#3D3F4C]">{revocableVotes}</span>
                                </span>
                            </div>
                        </form>
                    </>
                )}
            />
        </div>
    );
};

const History: React.FC = () => {
    const history = useHistory();

    return (
        <div className="p-[24px] pb-[16px] bg-white rounded-lg">
            <div className="font-medium mb-[12px]">Locking Votes</div>
            <div className="flex flex-row bg-[#F0F3FF]">
                <div className="w-1/5 py-3 px-4 border border-solid border-white">Votes</div>
                <div className="w-2/5 py-3 px-4 border border-solid border-white">Amount（CFX）</div>
                <div className="w-3/5 py-3 px-4 border border-solid border-white">End time</div>
                <div className="w-1/5 py-3 px-4 border border-solid border-white">Status</div>
            </div>
            {!history?.length && 
                <div className='mt-[16px] text-[14px] text-[#898D9A] text-center'>No Data</div>
            }
            {history?.map?.((item, index) => {
                return (
                    <div className="flex flex-row text-[14px] text-[#3D3F4C]" key={index}>
                        <div className="w-1/5 py-3 px-4 border border-solid border-white">{item.power}</div>
                        <div className="w-2/5 py-3 px-4 border border-solid border-white">{item.power * 1000}</div>
                        <div className="w-3/5 py-3 px-4 border border-solid border-white">{item.time}</div>
                        <div className="w-1/5 py-3 px-4 border border-solid border-white">{item.type === 'lock' ? 'Locking' : 'Unlocking'}</div>
                    </div>
                );
            })}
        </div>
    );
};

const Increase: React.FC = () => {
    return (
        <div className="w-[1142px] mt-[32px] mx-auto">
            <PosInfoPanel />
            <PosStakePanel />
            <History />
        </div>
    );
};
export default Increase;
