import React, { memo } from 'react';
import { useSpring, a } from '@react-spring/web';
import { PopupClass, PopupProps } from '../../Popup';
import Close from '../../../assets/close.svg';
import Success from '../../../assets/success-blue.svg';
import Warning from '../../../assets/warning.svg';
import Error from '../../../assets/error.svg';
import './index.css';

const Toast = new PopupClass();
Toast.setListStyle({
    top: '80px',
    left: 'unset',
    transform: 'unset',
    right: '12px',
    flexDirection: 'column',
    zIndex: 10000
});

Toast.setItemWrapperClassName('toast-item-wrapper');

const iconTypeMap = {
    success: Success,
    warning: Warning,
    failed: Error
} as const;

type Type = 'info' | 'success' | 'warning' | 'failed';

const ToastComponent: React.FC<{ content: string | Content; duration: number; hide: () => void; type: Type; }> = memo(({ content, duration, type = 'info', hide }) => {
    const props = useSpring({
        from: { transform: 'translateX(-100%)' },
        to: { transform: 'translateX(0%)' },
        config: { duration },
    });

    return (
        <div className="relative max-w[400px] min-w-[300px] bg-white rounded  overflow-hidden">
            <div className={type === 'info' ? 'p-[24px]' : 'pl-[56px] py-[24px] pr-[24px]'}>
                {type !== 'info' && <img src={iconTypeMap[type]} alt="type img" className="absolute w-[24px] h-[24px] left-[16px] top-[24px]" /> }
                <p className='mb-[8px] leading-[22px] text-[16px] text-[#3D3F4C] font-medium max-w-[280px]'>
                    {typeof content === 'object' && content.title ? content.title : 'Notification'}
                </p>
                <img src={Close} alt="close img" className='absolute right-[28px] top-[24px] w-[16px] h-[16px] cursor-pointer' onClick={hide} />
                {(typeof content === 'string' || content.text) &&
                    <p className='leading-[18px] text-[14px] text-[#898D9A] max-w-[320px]'>
                        {typeof content === 'string' ? content : content.text}
                    </p>
                }

                {typeof content === 'object' && (typeof content.onClickOk === 'function' || typeof content.onClickCancel === 'function') &&
                    <div className='mt-[20px] flex justify-end items-center gap-[16px]'>
                        {typeof content.onClickCancel === 'function' &&
                            <button className='button-outlined button-small min-w-[72px]' onClick={content.onClickCancel}>{content?.cancelButtonText ?? 'Cancel'}</button>
                        }
                        {typeof content.onClickOk === 'function' &&
                            <button className='button-contained button-small min-w-[72px]' onClick={content.onClickOk}>{content?.okButtonText ?? 'OK'}</button>
                        }
                    </div>
                }
            </div>

            {duration ? (
                <a.div className="absolute bottom-0 w-full h-[4px] bg-gradient-to-l from-[#15C184] to-[#808BE7]" style={props} />
            ) : null}
        </div>
    );
});

export interface Content {
    title?: string;
    text?: string;
    okButtonText?: string;
    cancelButtonText?: string;
    onClickOk?: () => void;
    onClickCancel?: () => void;
}

export const showToast = (content: string | Content, config?: Partial<PopupProps> & { type?: Type; }) => {
    let toastKey: number | string | null;
    const hide = () => toastKey && Toast.hide(toastKey);
    let _content: Content = {};
    if (typeof content === 'object') {
        _content = { ...content };
        if (typeof content.onClickCancel === 'function') {
            _content.onClickCancel = () => {
                content.onClickCancel?.();
                hide();
            }
        }
        if (typeof content.onClickOk === 'function') {
            _content.onClickOk = () => {
                content.onClickOk?.();
                hide();
            }
        }
    }

    toastKey = Toast.show({
        Content: <ToastComponent content={typeof content === 'object' ? _content : content} duration={config?.duration ?? 6000} hide={hide} type={config?.type ?? 'info'} />,
        duration: config?.duration ?? 6000,
        animationType: 'slideRight',
        ...config,
    });
}


export const hideToast = Toast.hide;
export const hideAllToast = Toast.hideAll;
