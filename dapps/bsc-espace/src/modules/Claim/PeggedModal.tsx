import React, { memo, useState } from 'react';
import { PopupClass } from 'common/components/Popup';
import Button from 'common/components/Button';
import Close from 'common/assets/icons/close.svg';

const PeggedModal = new PopupClass();
PeggedModal.setListStyle({
    top: '320px',
});
PeggedModal.setItemWrapperClassName('toast-item-wrapper');
PeggedModal.setAnimatedSize(false);

const PeggedModalContent: React.FC<{ toChain: string; amount: string; callback: () => void; }> = memo(({ toChain, amount, callback }) => {
    const [hasClickedContinue, setHasClickedContinue] = useState(false);

    return (
        <div className="w-[440px] p-[24px] rounded-[4px] bg-white">
            <img
                className="absolute right-[12px] top-[12px] w-[16px] h-[16px] cursor-pointer hover:scale-110 transition-transform select-none"
                onClick={PeggedModal.hideAll}
                src={Close}
                alt="close icon"
            />

            <p className="mb-[8px] font-medium text-[16px] text-[#1B1B1C] leading-[22px] text-center">Claim Information</p>
            <div className="mb-[24px] text-[14px] text-[#898D9A] leading-[18px]">
                <p>Insufficient liquidity on {toChain}</p>
                <p className='mt-[2px]'>You will receive {amount} PeggedCFX</p>
            </div>
            <div className='mb-[24px] bg-[#F7F8FA] p-[16px]'>
                <p className='mb-[8px] text-[16px] text-[#3D3F4C] leading-[22px]'>PeggedCFX minted 1:1 for each unclaimed CFX</p>
                <ul className="list-disc pl-[16px] text-[14px] text-[#898D9A] leading-[18px]">
					<li>Redeem later to get CFX on {toChain}.</li>
					<li>Cross-chain to where there is sufficient CFX liquidity.</li>
				</ul>
            </div>
            <div className='flex justify-center items-center gap-[12px]'>
                <Button
                    variant='outlined'
                    size="small"
                    className='min-w-[128px]'
                    onClick={PeggedModal.hideAll}
                >
                    Cancel
                </Button>
                <Button
                    variant='outlined'
                    size="small"
                    className='min-w-[128px]'
                    disabled={hasClickedContinue}
                    onClick={async () => {
                        setHasClickedContinue(true);
                        await callback();
                        PeggedModal.hideAll();
                    }}
                >
                    Continue
                </Button>
            </div>
        </div>
    );
});


export const showPeggedModal = ({ toChain, amount, callback }: { toChain: string; amount: string; callback: () => void; }) =>
    PeggedModal.show({
        Content: <PeggedModalContent toChain={toChain} amount={amount} callback={callback} />,
        duration: 0,
        showMask: true,
        animationType: 'door'
    });


export const hidePeggedModal = (key: string | number) => PeggedModal.hide(key);