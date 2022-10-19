import React, { memo, PropsWithChildren } from 'react';
import { PopupClass } from 'common/components/Popup';
import Close from 'common/assets/icons//close.svg';
import renderReactNode from 'common/utils/renderReactNode';

const TipModal = new PopupClass();
TipModal.setListStyle({
    top: '260px',
});
TipModal.setItemWrapperClassName('toast-item-wrapper');
TipModal.setAnimatedSize(false);

const TipModalContent = memo(({ children }: PropsWithChildren) => {
    return (
        <div className="relative w-[404px] p-[24px] bg-white rounded-lg">
            <img
                className="absolute right-[24px] top-[27px] w-[16px] h-[16px] cursor-pointer hover:scale-110 transition-transform select-none"
                onClick={TipModal.hideAll}
                src={Close}
                alt="close icon"
            />
            {children}
        </div>
    );
});

export const showTipModal = (Content: React.ReactNode | Function) =>
    TipModal.show({
        Content: <TipModalContent>{renderReactNode(Content)}</TipModalContent>,
        duration: 0,
        showMask: true,
        animationType: 'door',
        pressEscToClose: true
    });

export const hideTipModal = (key: string | number) => TipModal.hide(key);
