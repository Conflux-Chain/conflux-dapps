import { convertHexToCfx } from 'common/utils/addressUtils';
import Networks from 'common/conf/Networks';
import StakingContract from 'governance/src/contracts/staking.json';
import GovernanceContract from 'governance/src/contracts/governance.json';
import PosContract from 'governance/src/contracts/pos.json';
import ParamsControlContract from 'governance/src/contracts/paramsControl.json';
import PosLockContract from 'governance/src/contracts/posLock.json';
import { isProduction } from 'common/conf/Networks';
import createContract from 'common/utils/Contract';

interface Contracts {
    stakingContract: {
        deposit(amount: string): { encodeABI: () => string; };
        withdraw(amount: string): { encodeABI: () => string; };
        getVotePower(address: string, currentBlockNumber: string): { encodeABI: () => string; };
        voteLock(amount: string, unlockBlockNumber: string): { encodeABI: () => string; };
    };

    governanceContract: {
        getBlockNumber(): { encodeABI: () => string; };
        proposalCount(): { encodeABI: () => string; };
        getProposalList(offset: number, pageSize: number): { encodeABI: () => string; _method: { outputs: Array<any> }; };
        getProposalById(proposalId: number): { encodeABI: () => string; _method: { outputs: Array<any> };};
        vote(proposalId: number, optionId: number, power: string): { encodeABI: () => string; };
        voteThroughPosPool(pool: string, proposalId: number, optionId: number, power: string) : { encodeABI: () => string; };
        extendDelay(): { encodeABI: () => string; };
        getVoteForProposal(proposalId: number, voter: string, option: number): { encodeABI: () => string; _method: { outputs: Array<any> }; };
    };

    posContract: {
        addressToIdentifier(account: string): { encodeABI: () => string; };
    }

    paramsControlContract: {
        currentRound(): { encodeABI: () => string; };
        totalVotes(round: string): { encodeABI: () => string; _method: { outputs: Array<any> }; };
        readVote(account: string): { encodeABI: () => string; _method: { outputs: Array<any> }; };
        posStakeForVotes(round: string): { encodeABI: () => string; _method: { outputs: Array<any> }; };
        // castVote(round: string, vote_data: [[string, [string, string, string]], [string, [string, string, string]], [string, [string, string, string]]]): { encodeABI: () => string; };
        castVote(round: string, vote_data: [[string, [string, string, string]]]): { encodeABI: () => string; };
    }

    posLockContract: {
        userStakeAmount(account: string): { encodeABI: () => string; _method: { outputs: Array<any> }; };
        userLockInfo(account: string): { encodeABI: () => string; _method: { outputs: Array<any> }; };
    }
}

export const stakingContract = createContract<Contracts['stakingContract']>(StakingContract.abi);
export const stakingContractAddress = convertHexToCfx('0x0888000000000000000000000000000000000002', +Networks.core.chainId);
export const governanceContract = createContract<Contracts['governanceContract']>(GovernanceContract.abi);
export const governanceContractAddress = isProduction ? 'cfx:acev1c6tz2gu832fwdj45vxm71sffpat4yewvpteau' : (Networks.core.chainId === '8888' ? 'net8888:acf2rctm2gdgfccfg252tx00dd152gp28uf5w53at3' : 'cfxtest:acayg9f8j5ctwy1bcbtmtj510tbusj73a6efsb07f3');// cfxtest:acfwmpvz4f2wwhsmbja5n3vbr5ma568fg652szuugc
export const posContract = createContract<Contracts['posContract']>(PosContract.abi);
export const posContractAddress = convertHexToCfx('0x0888000000000000000000000000000000000005', +Networks.core.chainId);
export const paramsControlContract = createContract<Contracts['paramsControlContract']>(ParamsControlContract.abi);
export const paramsControlContractAddress = convertHexToCfx('0x0888000000000000000000000000000000000007', +Networks.core.chainId);
export const posLockContract = createContract<Contracts['posLockContract']>(PosLockContract.abi);

export default Contracts;
