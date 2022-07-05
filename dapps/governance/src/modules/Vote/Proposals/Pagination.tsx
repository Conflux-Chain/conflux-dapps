import React from 'react';
import cx from 'clsx';
import { useCurrentPage, setCurrentPage, usePageCount } from 'governance/src/store';
import Arrow from 'governance/src/assets/Arrow.svg';

const Pagination: React.FC<{ className?: string }> = ({ className }) => {
    const pageCount = usePageCount();
    const currentPage = useCurrentPage();

    return (
        <div className={cx('mt-[24px] flex justify-center gap-[12px] select-none transition-opacity', className)}>
            <div
                className={cx(
                    'pagination-item flex justify-center items-center w-[32px] h-[32px] rounded-[2px] text-[14px] font-medium text-center cursor-pointer transition-colors bg-white hover:bg-[#f0f3ff]',
                    currentPage === 1 && 'pointer-events-none'
                )}
                onClick={() => setCurrentPage(currentPage - 1)}
            >
                <span className={cx('pagination-arrow w-[16px] h-[16px] rotate-90 transition-opacity', currentPage === 1 && 'disabled')} />
            </div>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((index) => (
                <div
                    className={cx(
                        'pagination-item w-[32px] leading-[32px] rounded-[2px] text-[14px] font-medium text-center transition-colors',
                        index === currentPage ? 'bg-[#808BE7] text-white pointer-events-none' : 'bg-white text-[#808BE7] hover:bg-[#f0f3ff] cursor-pointer '
                    )}
                    onClick={() => setCurrentPage(index)}
                    key={index}
                >
                    {index}
                </div>
            ))}
            <div
                className={cx(
                    'pagination-item flex justify-center items-center w-[32px] h-[32px] rounded-[2px] text-[14px] font-medium text-center cursor-pointer transition-colors bg-white hover:bg-[#f0f3ff]',
                    currentPage === pageCount && 'pointer-events-none'
                )}
                onClick={() => setCurrentPage(currentPage + 1)}
            >
                <span className={cx('pagination-arrow w-[16px] h-[16px] -rotate-90 transition-opacity', currentPage === pageCount && 'disabled')} />
            </div>
        </div>
    );
};

export default Pagination;