import { startTrackBalance } from './balance';
import { startTrackPosAccount } from './pos';
import { startTrackBlockNumber, startTrackDaysToUnlock, startTrackUnlockBlockNumber } from './lockDays&blockNumber';
export * from './balance';
export * from './lockDays&blockNumber';
export * from './proposalList';
export * from './pos';
export * from './rewardInterestRate';


export const startTrack = () => {
    const unstakes: Array<() => void> = [];
    unstakes.push(startTrackBalance(), startTrackPosAccount(), startTrackBlockNumber(), startTrackDaysToUnlock(), startTrackUnlockBlockNumber());
    return () => {
        unstakes.forEach((unstake) => unstake());
    };
}