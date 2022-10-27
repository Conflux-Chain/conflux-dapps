import React from 'react';
import { useAccount, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import Panel from 'governance/src/components/Panel';
import Cell from 'governance/src/components/Cell';
import Button from 'common/components/Button';
import BalanceText from 'common/modules/BalanceText';
import Spin from 'common/components/Spin';
import { AuthCoreSpace } from 'common/modules/AuthConnectButton';
import { useLockedBalance, useAvailableStakedBalance, useVotingRights, useTimeToUnlock, useVotingRightsPerCfx, useGapBlockNumber, useUnlockBlockNumber } from 'governance/src/store';
import { judgeCanExtendLockingPeriod } from './Slider';
import CurrentVotingRights from 'governance/src/assets/CurrentVotingRights.svg';
import AvailableToLock from 'governance/src/assets/AvailableToLock.svg';
import Warning from 'common/assets/icons/warning2.svg';
import { showLockModal } from './LockModal';

const Lock: React.FC = () => {
    const account = useAccount();
    const votingRights = useVotingRights();
    const unlockBlockNumber = useUnlockBlockNumber();
    const availableStakedBalance = useAvailableStakedBalance();
    const isAvailableStakedBalanceGreaterThan0 = availableStakedBalance && Unit.greaterThan(availableStakedBalance, Unit.fromStandardUnit(0));

    return (
        <Panel title="Lock" className="row-span-2 col-span-1">
            <div className="flex gap-[24px]">
                <Cell
                    className="flex-1"
                    title="Current voting rights"
                    icon={CurrentVotingRights}
                    Content={
                        account && !votingRights ? <Spin />
                        : <BalanceText id="Current voting rights" balance={votingRights} symbol="" decimals={18} />
                    }
                    TipContent={CurrentVotingRightsTipContent}
                />
                <Cell
                    className="flex-1"
                    title="Available to lock"
                    icon={AvailableToLock}
                    Content={<BalanceText id="Lock Available Balance" balance={availableStakedBalance} symbol="CFX" decimals={18} />}
                />
            </div>

            <AddLockingAmount unlockBlockNumber={unlockBlockNumber} isAvailableStakedBalanceGreaterThan0={isAvailableStakedBalanceGreaterThan0}/>
            <ExtendLockingPeriod unlockBlockNumber={unlockBlockNumber} />

            <div className="pl-[48px] pr-[16px] py-[13px] rounded-[4px] bg-[#FCF1E8]">
                <div className="relative text-[16px] leading-[20px] text-[#3D3F4C]">
                    <img src={Warning} alt="warning image" className="absolute -left-[34px] top-[47%] -translate-y-[50%] w-[24px] h-[24px]" />
                    Tips
                </div>
                <div className="mt-[8px] text-[14px] leading-[18px] text-[#3D3F4C]">
                    The voting rights will be awarded according to: number of quarters × number of tokens × 0.25. The longest lock duration for voting is 1
                    year.
                </div>
            </div>

            {!unlockBlockNumber && (
                <AuthCoreSpace
                    id="governance-lock-auth"
                    className="mt-[147px]"
                    size="large"
                    fullWidth
                    type="button"
                    authContent={
                        <Button
                            className="mt-[147px]"
                            size="large"
                            fullWidth
                            disabled={!isAvailableStakedBalanceGreaterThan0}
                            onClick={() => showLockModal('lock')}
                        >
                            Lock
                        </Button>
                    }
                />
            )}
        </Panel>
    );
};

const AddLockingAmount: React.FC<{ unlockBlockNumber?: Unit; isAvailableStakedBalanceGreaterThan0?: boolean; }> =
({ unlockBlockNumber, isAvailableStakedBalanceGreaterThan0 }) => {
    const lockedBalance = useLockedBalance();

    return (
        <>
            <div className="flex flex-row justify-between items-center my-[24px] pl-[12px] pr-[16px] py-[16px] rounded-[4px] border-[1px] border-[#EAECEF] bg-[#FAFBFD]">
                <div>
                    <div className="text-[14px] leading-[18px] text-[#898D9A]">Current Locked</div>
                    <div className="mt-[16px] text-[16px] leading-[20px] text-[#3D3F4C]">
                        <BalanceText id="Current Locked" balance={lockedBalance} symbol={'CFX'} decimals={18} />
                    </div>
                </div>
                {unlockBlockNumber && (
                    <AuthCoreSpace
                        className="min-w-[150px]"
                        variant="outlined"
                        size="small"
                        connectTextType="concise"
                        authContent={() => (
                            <Button
                                className="min-w-[150px]"
                                variant="outlined"
                                size="small"
                                disabled={!isAvailableStakedBalanceGreaterThan0}
                                onClick={() => showLockModal('add')}
                            >
                                Add locking amount
                            </Button>
                        )}
                    />
                )}
            </div>
        </>
    )
}

const ExtendLockingPeriod: React.FC<{ unlockBlockNumber?: Unit }> = ({ unlockBlockNumber }) => {
    const gapBlockNumber = useGapBlockNumber();
    const canExtendLockingPeriod = judgeCanExtendLockingPeriod(gapBlockNumber);
    const timeToUnlock = useTimeToUnlock();
    const votingRightsPerCfx = useVotingRightsPerCfx();
    
    return (
        <>
            <div className="flex flex-row justify-between items-center my-[24px] pl-[12px] pr-[16px] py-[16px] rounded-[4px] border-[1px] border-[#EAECEF] bg-[#FAFBFD]">
                <div>
                    <div className="text-[14px] leading-[18px] text-[#898D9A]">{`About ${timeToUnlock ?? '--'} to unlock`}</div>
                    <div className="mt-[16px] text-[16px] leading-[20px] text-[#3D3F4C]">{`${votingRightsPerCfx ?? '--'} voting rights/CFX`}</div>
                </div>
                {unlockBlockNumber && (
                    <AuthCoreSpace
                        className="min-w-[150px]"
                        variant="outlined"
                        size="small"
                        connectTextType="concise"
                        authContent={() => (
                            <Button
                                className="min-w-[150px]"
                                variant="outlined"
                                size="small"
                                disabled={!canExtendLockingPeriod}
                                onClick={() => showLockModal('extend')}
                            >
                                Extend locking period
                            </Button>
                        )}
                    />
                )}
            </div>
        </>
    )
}

export const CurrentVotingRightsTipContent = (
    <>
        <div className="text-[16px] leading-[22px] font-medium text-[#3D3F4C]">Current voting rights</div>
        <div className="my-[8px] text-[14px] leading-[18px] text-[#898D9A]">
            The voting rights will be awarded according to:
            <br />
            <span className="text-[#3D3F4C]">number of quarters × number of tokens × 0.25.</span>
        </div>
        <div className="text-[14px] leading-[18px] text-[#898D9A]">For instance</div>
        <ul className="my-[8px] text-[14px] leading-[18px] text-[#3D3F4C]">
            <li>
                <span className="mr-[1px]">·</span>Locking expiration in less than a quarter: No voting rights.
            </li>
            <li>
                <span className="mr-[1px]">·</span>Locking expiration in more than a quarter: One CFX has 0.25 votes.
            </li>
            <li>
                <span className="mr-[1px]">·</span>Locking expiration in more than half a year: One CFX has 0.5 votes.
            </li>
            <li>
                <span className="mr-[1px]">·</span>Locking expiration in more than a year: One CFX has 1 votes.
            </li>
        </ul>
        <div className="text-[14px] leading-[18px] text-[#898D9A]">
            We measure 'time' in blocks based on the assumed number of 63,072,000 per year. While tokens are locked to obtain votes, users retain the right to
            staking interest. The longest locking duration for voting is 1 year. Whiletokens are locked to gain a voting right, users cannot withdraw the tokens
            or decrease the locking duration.
        </div>
    </>
);

export default Lock;
