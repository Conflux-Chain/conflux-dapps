import { startTrackBalance } from './balance';
import { startTrackPosAccount } from './pos';
import { startTrackBlockNumber, startTrackDaysToUnlock, startTrackUnlockBlockNumber, startTrackPowLockAmount, startTrackPosLockAmount } from './lockDays&blockNumber';
export * from './balance';
export * from './lockDays&blockNumber';
export * from './proposalList';
export * from './pos';
export * from './rewardInterestRate';


export const startTrack = () => {
    const unstakes: Array<() => void> = [];
    unstakes.push(startTrackBalance(), startTrackPosAccount(), startTrackBlockNumber(), startTrackDaysToUnlock(), startTrackUnlockBlockNumber(), startTrackPowLockAmount(), startTrackPosLockAmount());
    return () => {
        unstakes.forEach((unstake) => unstake());
    };
}