import { store as walletStore } from '@cfx-kit/react-utils/dist/AccountManage';
import { validateHexAddress, convertHexToCfx, validateCfxAddress } from 'common/utils/addressUtils';

export const checkPosData = (posdata: string) => {
    if (posdata.length < 74) {
        return false;
    }
    if (posdata.slice(0, 10) != '0xe335b451') {
        return false;
    }
    let hex = posdata.toLocaleLowerCase();
    if (!/^0x[0-9a-f]*$/.test(hex)) {
        return false;
    }
    return true;
};

export const ensureAddressForSdk = (oldOrNewAddress: string) => {
    const { chainId } = walletStore.getState();
    let address = oldOrNewAddress;
    if (validateHexAddress(address) && chainId) {
        address = convertHexToCfx(oldOrNewAddress, chainId);
    }
    if (validateCfxAddress(address)) {
        return address;
    }
    return oldOrNewAddress;
};
