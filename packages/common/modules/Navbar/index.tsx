import React, { isValidElement, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useChainIdNative } from 'governance/src/store/lockDays&blockNumber';
import { spaceSeat } from 'common/conf/Networks';
import WalletConnector from './WalletConnectorNew';
import SelectChainModule from './SelectChain';
import MenuIcon from '../../assets/icons/menu.svg';
import { changeExpand, useExpand } from '../../../../dapps/dapp-box/src/modules/Sidebar/sideBarStore';

interface Props {
    handleSwitchLocale?: () => void;
    handleSwitchMode?: () => void;
    dappIcon: string;
    dappName: string;
    Enhance?: {
        type: 'childRoutes';
        Content: React.ReactNode;
    };
}

const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const Navbar: React.FC<Props> = ({ handleSwitchLocale, handleSwitchMode, dappIcon, dappName, Enhance }) => {
    const expand = useExpand();
    const location = useLocation();
    const chainIdNative = useChainIdNative();
    const isCoreSpace = spaceSeat(chainIdNative) === 'core';
    const isGovernance = useMemo(() => location.pathname.indexOf('/governance') > -1, [location.pathname]);
    const isPos = useMemo(() => location.pathname.indexOf('/pos') > -1, [location.pathname]);
    const authSpace = useMemo(() => isPos ? 'Core' : isGovernance ? (isCoreSpace ? 'Core' : 'eSpace') : 'All', [isCoreSpace, isGovernance, isPos]);

    return (
        <>
            {!isMobile() && (
                <nav className="h-[64px] flex-shrink-0">
                    <div className="container h-full xl:mx-auto flex justify-between items-center whitespace-nowrap">
                        <div className="flex items-center">
                            <img className="mr-[4px] w-[24px] h-[24px]" src={dappIcon} alt="conflux-network icon" />
                            <h4 className="flex items-center h-[22px] text-[16px] font-medium text-black mb-0 ">{dappName}</h4>
                            {Enhance?.type === 'childRoutes' && isValidElement(Enhance?.Content) && Enhance?.Content}
                        </div>

                        <div className="flex justify-center items-center">
                            {location.pathname.indexOf('/governance') > -1 ? (
                                <>
                                    <SelectChainModule />
                                    <WalletConnector authSpace={authSpace} />
                                </>
                            ) : location.pathname.startsWith('/native-usdt0') ? (
                                <></>
                            ) : (
                                <WalletConnector authSpace={authSpace} />
                            )}
                        </div>
                    </div>
                </nav>
            )}
            {isMobile() && (
                <nav className="h-[50px] flex-shrink-0 bg-white">
                    <div className="container px-[20px] h-full xl:mx-auto flex justify-between items-center whitespace-nowrap">
                        <div className="flex justify-center items-center " onClick={changeExpand}>
                            {!expand && <img src={MenuIcon} className="h-[20px] w-[20px]" />}
                        </div>
                        <div className="flex justify-center items-center">
                            {location.pathname.startsWith('/native-usdt0') ? (
                                <></>
                            ) : (
                                <WalletConnector authSpace={authSpace} />
                            )}
                        </div>
                    </div>
                </nav>
            )}
        </>
    );
};

export default Navbar;
