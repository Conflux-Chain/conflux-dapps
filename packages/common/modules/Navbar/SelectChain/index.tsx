import React, { useState, useCallback, useEffect } from 'react';
import cx from 'clsx';
import Dropdown from 'common/components/Dropdown';
import { switchToCore, switchToESpace } from 'common/modules/AuthConnectButton';
import { useChainIdNative, setChainIdNative } from 'governance/src/store/lockDays&blockNumber';
import Networks from 'common/conf/Networks';
import CoreSpaceIcon from 'governance/src/assets/coreSpaceIcon.svg';
import ESpaceIcon from 'governance/src/assets/eSpaceIcon.svg';
import ArrowDown from 'common/assets/icons/arrow-down.svg';


const Select: React.FC<{ children: (triggerDropdown: () => void, visible: boolean) => JSX.Element; }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const triggerDropdown = useCallback(() => setVisible(pre => !pre), []);
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
            className="relative w-fit min-w-[141px] rounded-[4px] bg-white shadow-dropdown contain-content"
            Content={<DropdownChain hideDropdown={hideDropdown} />}
        >
            {children(triggerDropdown, visible)}
        </Dropdown>
    )
}

const DropdownChain: React.FC<{ hideDropdown: () => void; }> = ({ hideDropdown }) => {
    return (
        <div className='w-full'>
            <div className='flex items-center h-[32px] hover:bg-[#808BE74D] cursor-default' onClick={() => {
                switchToCore()
                setChainIdNative(Networks.core.chainId)
                hideDropdown();
            }}>
                <img className='w-[16px] h-[16px] ml-[16px] mr-[4px]' src={CoreSpaceIcon} alt="" />Core Space
            </div>
            <div className='flex items-center h-[32px] hover:bg-[#808BE74D] cursor-default' onClick={() => {
                switchToESpace();
                setChainIdNative(Networks.eSpace.chainId)
                hideDropdown();
            }}>
                <img className='w-[16px] h-[16px] ml-[16px] mr-[4px]' src={ESpaceIcon} alt="" /> eSpace
            </div>
        </div>
    )
}

const SelectChainModule = () => {
    const chainId = useChainIdNative();
    return <Select>
        {(triggerDropdown, visible) => <div
            className={cx(
                "w-[141px] connector flex items-center h-[32px] rounded-[20px] pl-[16px] mr-[16px] border cursor-pointer select-none transition-all overflow-hidden contain-content border-[#EAECEF] bg-[#FFFFFF]",
                {
                    'dropdown-visible': visible
                }
            )}
            onClick={triggerDropdown}
        >
            <img className='w-[16px] h-[16px] mr-[4px]' src={chainId && ['71', '1030'].includes(chainId) ? ESpaceIcon : CoreSpaceIcon} alt="" />
            <div className='flex-1'>
                {

                    chainId && ['71', '1030'].includes(chainId) ? 'eSpace' : 'Core Space'
                }
            </div>
            <img src={ArrowDown} alt="arrow down" className="arrow-down ml-[4px] mr-[16px] w-[16px] h-[16px] transition-transform" draggable="false" />
        </div>}
    </Select>
}

export default SelectChainModule;