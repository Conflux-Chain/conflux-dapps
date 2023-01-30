import React, { memo, PropsWithChildren } from 'react';
import { PopupClass } from 'common/components/Popup';
import renderReactNode from 'common/utils/renderReactNode';

const TipModal = new PopupClass();
TipModal.setListStyle({
  top: '260px',
});
TipModal.setItemWrapperClassName('toast-item-wrapper');
TipModal.setAnimatedSize(false);

const ModalContent = memo(({ children }: PropsWithChildren) => {
  return (
    <div className="relative w-[404px] p-[24px] bg-white rounded-lg">
      {children}
    </div>
  );
});

export const showModal = (Content: React.ReactNode | Function) =>
  TipModal.show({
    Content: <ModalContent>{renderReactNode(Content)}</ModalContent>,
    duration: 0,
    showMask: true,
    animationType: 'door',
    pressEscToClose: true
  });

export const hideModal = TipModal.hideAll;
