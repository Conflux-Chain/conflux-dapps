import { convertHexToCfx } from 'common/utils/addressUtils';
import Networks from 'common/conf/Networks';
import StakingContract from 'governance/src/contracts/staking.json';
import GovernanceContract from 'governance/src/contracts/governance.json';
import PosContract from 'governance/src/contracts/pos.json';
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
        vote(proposalId: number, optionId: number): { encodeABI: () => string; };
        extendDelay(): { encodeABI: () => string; };
    };

    posContract: {
        addressToIdentifier(account: string): { encodeABI: () => string; };
    }
}

export const stakingContract = createContract<Contracts['stakingContract']>(StakingContract.abi);
export const stakingContractAddress = convertHexToCfx('0x0888000000000000000000000000000000000002', +Networks.core.chainId);
export const governanceContract = createContract<Contracts['governanceContract']>(GovernanceContract.abi);
export const governanceContractAddress = isProduction ? 'cfx:acev1c6tz2gu832fwdj45vxm71sffpat4yewvpteau' : 'cfxtest:acfwmpvz4f2wwhsmbja5n3vbr5ma568fg652szuugc';
export const posContract = createContract<Contracts['posContract']>(PosContract.abi);
export const posContractAddress = convertHexToCfx('0x0888000000000000000000000000000000000005', +Networks.core.chainId);

export default Contracts;
