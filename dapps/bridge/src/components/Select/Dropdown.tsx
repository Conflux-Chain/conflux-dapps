import { useState, useCallback, useEffect } from 'react';
import cx from 'clsx';
import CustomScrollbar from 'custom-react-scrollbar';
import Dropdown from 'common/components/Dropdown';
import { isEqual } from 'lodash-es';
import { type Props } from './index';

const SelectDropdown = <T extends any>({
    children,
    ...props
}: { children: (triggerDropdown: () => void, visible: boolean) => JSX.Element } & Omit<Props<T>, 'id'>) => {
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
            className="relative flex flex-col w-[432px] rounded-[4px] bg-white shadow contain-content overflow-hidden"
            Content={<DropdownContent visible={visible} hideDropdown={hideDropdown} {...props} />}
            appendTo={document.body}
        >
            {children(triggerDropdown, visible)}
        </Dropdown>
    );
};

const DropdownContent = <T extends any>({
    data,
    renderItem,
    hideDropdown,
    current,
    onSelect,
}: { visible: boolean; hideDropdown: () => void } & Omit<Props<T>, 'id'>) => {
    return (
        <CustomScrollbar className="token-list">
            {data.map((item, index) => (
                <div
                    key={typeof item === 'string' ? item : index}
                    className={cx(
                        'relative flex justify-between items-center h-[48px] pl-[16px] pr-[20px]',
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
    );
};

export default SelectDropdown;
