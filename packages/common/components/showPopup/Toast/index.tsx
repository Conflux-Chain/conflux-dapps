import React, { memo } from 'react';
import { useSpring, a } from '@react-spring/web';
import { PopupClass, PopupProps } from 'common/components/Popup';
import Button from 'common/components/Button';
import Close from 'common/assets/icons/close.svg';
import Success from 'common/assets/icons/success-blue.svg';
import Warning from 'common/assets/icons/warning.svg';
import Error from 'common/assets/icons/error.svg';
import './index.css';

const Toast = new PopupClass();
const SpecialToast = new PopupClass();
[Toast, SpecialToast].forEach(_Toast => {
    _Toast.setListStyle({
        top: '80px',
        left: 'unset',
        transform: 'unset',
        right: '12px',
        flexDirection: 'column',
        zIndex: 10000
    });
    _Toast.setItemWrapperClassName('toast-item-wrapper');
});

const iconTypeMap = {
    success: Success,
    warning: Warning,
    failed: Error
} as const;

type Type = 'info' | 'success' | 'warning' | 'failed';

const ToastComponent: React.FC<{ content: string | Content; duration: number; hide: () => void; type: Type; showClose?: boolean; }> = memo(({ content, duration, type = 'info', showClose = true, hide }) => {
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
                {showClose && <img src={Close} alt="close img" className='absolute right-[28px] top-[24px] w-[16px] h-[16px] cursor-pointer' onClick={hide} />}
                {(typeof content === 'string' || content.text) &&
                    <p className='leading-[18px] text-[14px] text-[#898D9A] max-w-[320px]'>
                        {typeof content === 'string' ? content : content.text}
                    </p>
                }

                {typeof content === 'object' && (typeof content.onClickOk === 'function' || typeof content.onClickCancel === 'function') &&
                    <div className='mt-[20px] flex justify-end items-center gap-[16px]'>
                        {typeof content.onClickCancel === 'function' &&
                            <Button className='min-w-[72px]' size="small" onClick={content.onClickCancel}>{content?.cancelButtonText ?? 'Cancel'}</Button>
                        }
                        {typeof content.onClickOk === 'function' &&
                            <Button className='min-w-[72px]' size="small" onClick={content.onClickOk}>{content?.okButtonText ?? 'OK'}</Button>
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

export const showToast = (content: string | Content, config?: Partial<PopupProps> & { type?: Type; } & { special?: boolean; }) => {
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

    toastKey = (config?.special ? SpecialToast: Toast).show({
        Content: <ToastComponent content={typeof content === 'object' ? _content : content} duration={config?.duration ?? 6000} hide={hide} type={config?.type ?? 'info'} showClose={config?.showClose} />,
        duration: config?.duration ?? 6000,
        animationType: 'slideRight',
        ...config,
    });
    return toastKey;
}


export const hideToast = Toast.hide;
export const hideAllToast = Toast.hideAll;
export const hideSpecialToast = SpecialToast.hide;
export const hideAllSpecialToast = SpecialToast.hideAll;
