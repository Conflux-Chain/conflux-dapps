import { convertHexToCfx } from 'common/utils/addressUtils';
import Networks from 'common/conf/Networks';
import StakingContract from 'governance/src/contracts/staking.json';
import GovernanceContract from 'governance/src/contracts/governance.json';
import PosContract from 'governance/src/contracts/pos.json';
import ParamsControlContract from 'governance/src/contracts/paramsControl.json';
import PosPoolContract from 'governance/src/contracts/posPool.json';
import posLockVotingEscrow from 'governance/src/contracts/posLockVotingEscrow.json';
import UtilContract from 'governance/src/contracts/util.json';
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
        getVoteForProposal(proposalId: number, voter: string, option?: number): { encodeABI: () => string; _method: { outputs: Array<any> }; };
        getPoolVoteForProposal(proposalId: number, pool: string, voter: string): { encodeABI: () => string; _method: { outputs: Array<any> }; };
    };

    posContract: {
        addressToIdentifier(account: string): { encodeABI: () => string; };
    }

    paramsControlContract: {
        currentRound(): { encodeABI: () => string; };
        totalVotes(round: string): { encodeABI: () => string; _method: { outputs: Array<any> }; };
        readVote(account: string): { encodeABI: () => string; _method: { outputs: Array<any> }; };
        posStakeForVotes(round: string): { encodeABI: () => string; _method: { outputs: Array<any> }; };
        castVote(round: string, vote_data: [[string, [string, string, string]]]): { encodeABI: () => string; };
    }

    posPoolContract: {
        votingEscrow(): { encodeABI: () => string; _method: { outputs: Array<any> }; };
    }

    posLockVotingEscrowContract: {
        userStakeAmount(account: string): { encodeABI: () => string; _method: { outputs: Array<any> }; };
        userLockInfo(account: string): { encodeABI: () => string; _method: { outputs: Array<any> }; };
        createLock(amount: string, unlockBlockNumber: string): { encodeABI: () => string; };
        increaseLock(amount: string): { encodeABI: () => string; };
        extendLockTime(unlockBlockNumber: string): { encodeABI: () => string; };
        castVote(round: string, topicIndex: number, vote_data: [string, string, string]): { encodeABI: () => string; };
        userVotePower(account: string, currentBlockNumber: string): { encodeABI: () => string; _method: { outputs: Array<any> }; };
    }

    utilContract: {
        getSelfStakeInfo(account: string): { encodeABI: () => string; _method: { outputs: Array<any> }; };
        getStakeInfos(pool: string[], account: string): { encodeABI: () => string; _method: { outputs: Array<any> }; };
    }
}

export const stakingContract = createContract<Contracts['stakingContract']>(StakingContract.abi);
export const stakingContractAddress = convertHexToCfx('0x0888000000000000000000000000000000000002', +Networks.core.chainId);
export const governanceContract = createContract<Contracts['governanceContract']>(GovernanceContract.abi);
export const governanceContractAddress = isProduction ? 'cfx:acd1xg56needgaj9br1dw251135ag1y8fat0zk0arr' : (Networks.core.chainId === '8888' ? 'NET8888:ACB7V6XWTWKXRVE9CBZFBASYJFUGGM57AA8YGT7DVK' : 'cfxtest:achxp4p0bcsngpz6b5mv11p2wsn2u51sdjuyzjfm8f');
export const posContract = createContract<Contracts['posContract']>(PosContract.abi);
export const posContractAddress = convertHexToCfx('0x0888000000000000000000000000000000000005', +Networks.core.chainId);
export const paramsControlContract = createContract<Contracts['paramsControlContract']>(ParamsControlContract.abi);
export const paramsControlContractAddress = convertHexToCfx('0x0888000000000000000000000000000000000007', +Networks.core.chainId);
export const posPoolContract = createContract<Contracts['posPoolContract']>(PosPoolContract.abi);
export const posLockVotingEscrowContract = createContract<Contracts['posLockVotingEscrowContract']>(posLockVotingEscrow.abi);
export const utilContractAddress = isProduction ? 'cfx:achna9fyp9cep7f10198zr1a7e5dg8gu6ee3uy9nbp' : (Networks.core.chainId === '8888' ? 'NET8888:ACDWRU2F4FY3YZXN958FUBRSM62T0D90D2KG9449XG' : 'cfxtest:acc8c30wra8czb9ajz8sj6ug3x0u9vzsvuncee39mg');
export const utilContract = createContract<Contracts['utilContract']>(UtilContract.abi);

export const governanceContractAddressESpace = isProduction ? '' : '0x4d2b9D83bE08363cE05240157B1879137803156E';
export const utilContractAddressESpace = isProduction ? '' : '0x56f56850F14Acc68E95B87B06cD11Ef63f7aEA3A';

export default Contracts;
