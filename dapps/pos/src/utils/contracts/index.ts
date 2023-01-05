import Networks from 'common/conf/Networks';
import { convertHexToCfx } from 'common/utils/addressUtils';
import PosContract from 'governance/src/contracts/pos.json';
import createContract from 'common/utils/Contract';

interface Contracts {
    posContract: {
        addressToIdentifier(account: string): { encodeABI: () => string };
        getVotes(account: string): { encodeABI: () => string; _method: { outputs: Array<any> }; };
        increaseStake(stakeVotes: string): { encodeABI: () => string };
        retire(unstakeVotes: string): { encodeABI: () => string };
    };
}

export const posContract = createContract<Contracts['posContract']>(PosContract.abi);
export const posContractAddress = convertHexToCfx('0x0888000000000000000000000000000000000005', +Networks.core.chainId);
