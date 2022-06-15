import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as confluxStore, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { fetchChain } from 'common/utils/fetchChain';
import Networks from 'common/conf/Networks';
import { validateCfxAddress, convertCfxToHex } from 'common/utils/addressUtils';
import { posContract, posContractAddress } from './contracts';

export const POS_VOTE_CFX_BASE = Unit.fromMinUnit(1000);

interface PosStore {
    posInfo?: any;
    posLockedBalance?: Unit;
    posUnlockedBalance?: Unit;
    posTotalBalance?: Unit;
}

export const posStore = create(
    subscribeWithSelector(
        () =>
            ({
                posInfo: undefined,
                posLockedBalance: undefined,
                posUnlockedBalance: undefined,
                posTotalBalance: undefined,
            } as PosStore)
    )
);

const zeroAddress = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const startTrackPosAccount = () => {
    return confluxStore.subscribe(
        (state) => state.accounts,
        (accounts) => {
            const account = accounts?.[0];

            if (!account || !validateCfxAddress(account)) {
                posStore.setState({ posInfo: undefined });
                return;
            }

            fetchChain({
                rpcUrl: Networks.core.rpcUrls[0],
                method: 'cfx_call',
                params: [
                    {
                        to: posContractAddress,
                        data: posContract.addressToIdentifier(convertCfxToHex(account)).encodeABI(),
                    },
                    'latest_state',
                ],
            })
                .then((posAddressOrigin) => {
                    if (posAddressOrigin !== zeroAddress) {
                        fetchChain({
                            rpcUrl: Networks.core.rpcUrls[0],
                            method: 'pos_getAccount',
                            params: [posAddressOrigin, 'latest_state'],
                        })
                            .then((posInfo) => {
                                const status = posInfo.status || {};
                                const inQueue = status.inQueue || [];
                                const outQueue = status.outQueue || [];
                                const locked = status.locked;
                                let lockingTotal = Unit.fromMinUnit(0);
                                let unlockingTotal = Unit.fromMinUnit(0);
                                if (inQueue && inQueue.length > 0) {
                                    inQueue.forEach((element) => {
                                        lockingTotal = lockingTotal.add(Unit.fromMinUnit(element?.power ?? 0));
                                    });
                                }
                                lockingTotal.add(Unit.fromMinUnit(locked || 0));
                                lockingTotal = lockingTotal.mul(POS_VOTE_CFX_BASE);
                                if (outQueue && outQueue.length > 0) {
                                    outQueue.forEach((element) => {
                                        unlockingTotal = unlockingTotal.add(Unit.fromMinUnit(element?.power).mul(POS_VOTE_CFX_BASE));
                                    });
                                }

                                posStore.setState({ posInfo, posLockedBalance: lockingTotal, posUnlockedBalance: unlockingTotal, posTotalBalance: lockingTotal.add(unlockingTotal) });
                            });
                    } else {
                        posStore.setState({ posInfo: undefined, posLockedBalance: Unit.fromMinUnit(0), posUnlockedBalance: Unit.fromMinUnit(0), posTotalBalance: Unit.fromMinUnit(0) });
                    }
                })
                .catch(() => posStore.setState({ posInfo: undefined, posLockedBalance: Unit.fromMinUnit(0), posUnlockedBalance: Unit.fromMinUnit(0), posTotalBalance: Unit.fromMinUnit(0) }));
        },
        { fireImmediately: true }
    );
};

const selectors = {
    posTotalBalance: (state: PosStore) => state.posTotalBalance,
};

export const usePosTotalBalance = () => posStore(selectors.posTotalBalance);
