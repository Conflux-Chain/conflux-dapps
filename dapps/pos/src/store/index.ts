import { startTrackPosAccount, startTrackPosInfo } from './pos';
export * from './pos';

export const startTrack = () => {
    const unstakes: Array<() => void> = [];
    unstakes.push(startTrackPosAccount(), startTrackPosInfo());
    return () => {
        unstakes.forEach((unstake) => unstake());
    };
};
