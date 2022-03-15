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
                <p className='relative mb-[8px] leading-[22px] text-[16px] text-[#3D3F4C] font-medium'>
                    {typeof content === 'object' && content.title ? content.title : 'Notification'}
                    <img src={Close} alt="close img" className='absolute right-0 top-[50%] -translate-y-[50%] w-[16px] h-[16px] cursor-pointer' onClick={hide} />
                </p>
                {(typeof content === 'string' || content.text) &&
                    <p className='leading-[18px] text-[14px] text-[#898D9A]'>
                        {typeof content === 'string' ? content : content.text}
                    </p>
                }
            </div>

            {duration ? (
                <a.div className="absolute bottom-0 w-full h-[4px] bg-gradient-to-l from-[#15C184] to-[#808BE7]" style={props} />
            ) : null}
        </div>
    );
});

interface Content {
    title?: string;
    text?: string;
}

export const showToast = (content: string | Content, config?: Partial<PopupProps> & { type?: Type; }) => {
    let toastKey: number | string | null;
    const hide = () => toastKey && Toast.hide(toastKey);

    toastKey = Toast.show({
        Content: <ToastComponent content={content} duration={config?.duration ?? 6000} hide={hide} type={config?.type ?? 'info'} />,
        duration: config?.duration ?? 6000,
        animationType: 'slideRight',
        ...config,
    });
}


export const hideToast = Toast.hide;
