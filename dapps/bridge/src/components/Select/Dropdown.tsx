import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import cx from 'clsx';
import CustomScrollbar from 'custom-react-scrollbar';
import Input from 'common/components/Input';
import Dropdown from 'common/components/Dropdown';
import { isEqual, debounce, escapeRegExp } from 'lodash-es';
import Search from 'common/assets/icons/search.svg';
import { useCommonTokens, handleTokenChange } from '../../modules/data';
import { type Props } from './index';

const SelectDropdown: React.FC<{ children: (triggerDropdown: () => void, visible: boolean) => JSX.Element } & Omit<Props, 'id'>> = ({ children, ...props }) => {
    const [visible, setVisible] = useState(false);

    const triggerDropdown = useCallback(() => setVisible((pre) => !pre), []);

    const hideDropdown = useCallback(() => setVisible(false), []);

    useEffect(() => {
        function onKeyDown(evt: KeyboardEvent) {
            if (evt.keyCode === 27) {
                hideDropdown();
            }
        }
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <Dropdown
            visible={visible}
            onClickOutside={hideDropdown}
            className="relative flex flex-col md:w-[432px] w-[324px] rounded-[4px] bg-white shadow contain-content overflow-hidden"
            Content={<DropdownContent visible={visible} hideDropdown={hideDropdown} {...props} />}
            appendTo={document.body}
        >
            {children(triggerDropdown, visible)}
        </Dropdown>
    );
};

const DropdownContent: React.FC<{ visible: boolean; hideDropdown: () => void } & Omit<Props, 'id'>> = ({
    data,
    renderItem,
    hideDropdown,
    current,
    onSelect,
    visible,
    useSearch,
}) => {
    const commonTokens = useCommonTokens();
    const filteredCommonTokens = useMemo(() => commonTokens?.filter((token) => data?.includes(token)), [commonTokens, data]);

    const inputRef = useRef<HTMLInputElement>(null!);
    const [filter, setFilter] = useState('');
    const handleFilterChange = useCallback<React.FormEventHandler<HTMLInputElement>>(
        debounce((evt) => setFilter((evt.target as HTMLInputElement).value), 200),
        []
    );

    useEffect(() => {
        if (!visible && inputRef.current) {
            inputRef.current.value = '';
            setFilter('');
        }
    }, [visible]);

    const filteredData = useMemo(() => {
        if (!filter) return data;
        return data?.filter(
            (token) => token.search(new RegExp(escapeRegExp(filter), 'i')) !== -1 || filter.search(new RegExp(escapeRegExp(token), 'i')) !== -1
        );
    }, [filter, data]);

    return (
        <>
            {useSearch && (
                <div className="px-[16px] pt-[16px] pb-[12px] select-none">
                    <Input className="pr-[12px]" ref={inputRef} prefixIcon={Search} placeholder="Search token symbol" onChange={handleFilterChange} />

                    {filteredCommonTokens && filteredCommonTokens.length > 0 && (
                        <>
                            <div className="mt-[12px] mb-[8px] text-[14px] text-[#A9ABB2]">Common tokens</div>
                            <CustomScrollbar contentClassName="items-center pb-[16px] gap-[12px]" direction="horizontal">
                                {filteredCommonTokens?.map((token) => (
                                    <div
                                        key={token}
                                        className={cx(
                                            'shrink-0 px-[16px] h-[32px] leading-[32px] rounded-[18px] border border-[#EAECEF] text-center text-[14px] cursor-pointer hover:border-[#808BE7] transition-colors',
                                            isEqual(current, token) ? 'bg-[#808BE7] text-white pointer-events-none' : 'text-[#3D3F4C]'
                                        )}
                                        onClick={() => {
                                            handleTokenChange(token);
                                            hideDropdown();
                                        }}
                                    >
                                        {token}
                                    </div>
                                ))}
                            </CustomScrollbar>
                        </>
                    )}
                </div>
            )}

            {!filteredData?.length && (
                <div className={'flex items-center h-[56px] pl-[16px] pr-[20px] bg-white text-[14px] text-[#3D3F4C]'}>No matched token.</div>
            )}

            <CustomScrollbar className="token-list">
                {filteredData.map((item, index) => (
                    <div
                        key={typeof item === 'string' ? item : index}
                        className={cx(
                            'relative flex justify-between items-center h-[48px] pl-[16px] pr-[20px] md:text-[14px] text-[12px]',
                            isEqual(current, item) ? 'bg-[#808BE7] bg-opacity-30' : 'bg-white hover:bg-[#808BE7] hover:bg-opacity-10 cursor-pointer'
                        )}
                        onClick={() => {
                            hideDropdown();
                            onSelect(item);
                        }}
                    >
                        {renderItem(item)}
                    </div>
                ))}
            </CustomScrollbar>
        </>
    );
};

export default SelectDropdown;
