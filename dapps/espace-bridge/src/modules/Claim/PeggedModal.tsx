import React, { memo } from 'react';
import { PopupClass } from 'common/components/Popup';
import Success from 'common/assets/success.svg';
import Close from 'common/assets/close.svg';

const PeggedModal = new PopupClass();
PeggedModal.setListStyle({
    top: '320px',
});

const PeggedModalContent: React.FC<{}> = memo(({  }) => {
    return (
        <div className="w-[340px] min-h-[150px] p-[24px] text-center bg-gray-200 rounded-[8px]">
            <p className="font-medium text-[16px] text-[#3D3F4C] mt-[12px] leading-[22px]">Waiting</p>
        </div>
    );
});


export const showPeggedModal = () =>
    PeggedModal.show({
        Content: <PeggedModalContent />,
        duration: 0,
        showMask: true,
        animationType: 'door',
    });


export const hidePeggedModal = (key: string | number) => PeggedModal.hide(key);