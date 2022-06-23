import { convertHexToCfx, convertCfxToHex } from 'common/utils/addressUtils';
import Networks from 'common/conf/Networks';
import ConfluxSideContract from 'cross-space/src/contracts/ConfluxSide.json';
import EVMSideContract from 'cross-space/src/contracts/EVMSide.json';
import CrossSpaceContract from 'common/contracts/CrossSpace.json';
import ERC20Contract from 'common/contracts/ERC20.json';
import { isProduction } from 'common/conf/Networks';
import createContract from 'common/utils/Contract';

interface Contracts {
    eSpaceMirrorAddress: string;

    crossSpaceContractAddress: string;
    crossSpaceContract: {
        transferEVM(eSpaceAccount: string): { encodeABI: () => string; };
        withdrawFromMapped(eSpaceMirrorAddress: string): { encodeABI: () => string; };
    };

    confluxSideContractAddress: string;
    confluxSideContract: {
        crossToEvm(coreTokenAddress: string, eSpaceAccount: string, amount: string): { encodeABI: () => string; };
        crossFromEvm(eSpaceTokenNativeAddress: string, eSpaceAccount: string, amount: string): { encodeABI: () => string; };
        withdrawToEvm(eSpaceTokenNativeAddress: string, eSpaceAccount: string, amount: string): { encodeABI: () => string; };
        withdrawFromEvm(coreTokenAddress: string, eSpaceAccount: string, amount: string): { encodeABI: () => string; };

        mappedTokens(tokenAddress: string): { encodeABI: () => string; };
        sourceTokens(tokenAddress: string): { encodeABI: () => string; };
    };

    evmSideContractAddress: string;
    evmSideContract: {
        lockToken(eSpaceTokenNativeAddress: string, coreAccount: string, amount: string): { encodeABI: () => string; };
        lockedToken(eSpaceTokenNativeAddress: string, eSpaceAccount: string, coreAccount: string): { encodeABI: () => string; };

        lockMappedToken(coreTokenMappedAddress: string, coreAccount: string, amount: string): { encodeABI: () => string; };
        lockedMappedToken(coreTokenMappedAddress: string, eSpaceAccount: string, coreAccount: string): { encodeABI: () => string; };

        mappedTokens(tokenAddress: string): { encodeABI: () => string; };
        sourceTokens(tokenAddress: string): { encodeABI: () => string; };
    };

    tokenContract: {
        approve(spenderAddress: string, amount: string): { encodeABI: () => string; };
        allowance(ownerAddress: string, spenderAddress: string): { encodeABI: () => string; };
        name(): { encodeABI: () => string; };
        symbol(): { encodeABI: () => string; };
        decimals(): { encodeABI: () => string; };
    }
}

const Contracts = {
    crossSpaceContract: createContract<Contracts['crossSpaceContract']>(CrossSpaceContract.abi),
    crossSpaceContractAddress: convertHexToCfx(CrossSpaceContract.address, +Networks.core.chainId),
    confluxSideContract: createContract<Contracts['confluxSideContract']>(ConfluxSideContract.abi),
    confluxSideContractAddress: convertCfxToHex(isProduction ? 'cfx:acfcrckktgx99scxwr6jtjx81yhm4ggsfatprwzb3x' : 'cfxtest:acgnzsg6akz548uusxahx7dxurbvfch8vyxeadfkac'),
    confluxSideContractAddressBase32: isProduction ? 'cfx:acfcrckktgx99scxwr6jtjx81yhm4ggsfatprwzb3x' : 'cfxtest:acgnzsg6akz548uusxahx7dxurbvfch8vyxeadfkac',
    evmSideContract: createContract<Contracts['evmSideContract']>(EVMSideContract.abi),
    evmSideContractAddress: isProduction ? '0x4f9e3186513224cf152016ccd86019e7b9a3c809' : '0xe1b1457682536eb6e28be1ac215165d48354d4e1',
    tokenContract: createContract<Contracts['tokenContract']>(ERC20Contract),
}

export default Contracts;
