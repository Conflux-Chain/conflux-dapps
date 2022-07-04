import { startTrackBalance } from './balance';
import { startTrackPosAccount } from './pos';
import { startTrackBlockNumber, startTrackDaysToUnlock, startTrackUnlockBlockNumber } from './vote&blockNumber';
export * from './balance';
export * from './vote&blockNumber';
export * from './proposalList';
export * from './pos';


export const startTrack = () => {
    const unstakes: Array<() => void> = [];
    unstakes.push(startTrackBalance(), startTrackPosAccount(), startTrackBlockNumber(), startTrackDaysToUnlock(), startTrackUnlockBlockNumber());
    return () => {
        unstakes.forEach((unstake) => unstake());
    };
}