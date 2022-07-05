import React, { useCallback } from 'react';
import { useChainId } from '@cfxjs/use-wallet-react/conflux/Fluent';
import cx from 'clsx';
import renderReactNode from 'common/utils/renderReactNode';
import QuestionMark from 'common/assets/icons/QuestionMark.svg';
import { showTipModal } from 'governance/src/components/TipModal';
import Network from 'common/conf/Networks';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    icon: string;
    TipContent?: React.ReactNode | Function;
    Content?: React.ReactNode | Function;
}

const Cell: React.FC<Props> = ({ className, title, icon, TipContent, Content, children, ...props }) => {
    const chainId = useChainId();
    const handleClickQuestionMark = useCallback(() => {
        if (!TipContent) return;
        showTipModal(TipContent);
    }, [TipContent]);

    return (
        <div className={cx('relative px-[58px] pr-[12px] py-[14px] rounded-[8px] border-[1px] border-[#EAECEF] bg-white', className)} {...props}>
            <img src={icon} className="absolute left-[12px] top-[50%] -translate-y-[50%] w-[38px] h-[38px]" />
            <p className="flex items-center mb-[4px] text-[12px] h-[16px] leading-[16px] text-[#898D9A]">
                {title}
                {!!TipContent && (
                    <img
                        src={QuestionMark}
                        alt="question mark"
                        className="ml-[4px] cursor-pointer hover:scale-110 transition-transform select-none"
                        onClick={handleClickQuestionMark}
                    />
                )}
            </p>
            <p className="text-[16px] h-[20px] leading-[20px] text-[#1B1B1C]">{chainId === Network.core.chainId && Content ? renderReactNode(Content) : '--'}</p>
        </div>
    );
};

export default Cell;
