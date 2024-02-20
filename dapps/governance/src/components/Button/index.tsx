import Button from 'common/components/Button';
import { useChainIdNative } from 'governance/src/store';
import { spaceSeat } from 'common/conf/Networks';
import { switchToCore, switchToESpace } from 'common/modules/AuthConnectButton';

export const SwitchChainButton: React.FC = () => {
    const chainIdNative = useChainIdNative();
    const isESpace = spaceSeat(chainIdNative) === 'eSpace';

    return <Button
        id="RewardInterestRate-switchNetwork"
        className="mt-[26px] !flex min-w-[96px] !h-[32px] !text-[14px]"
        onClick={() => isESpace ? switchToESpace() : switchToCore()}>
        Switch Wallet Network
    </Button>
}