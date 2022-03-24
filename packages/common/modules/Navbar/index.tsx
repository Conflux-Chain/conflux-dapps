import React, { isValidElement } from 'react';
import WalletConnector from './WalletConnector';

interface Props {
    handleSwitchLocale?: () => void;
    handleSwitchMode?: () => void;
    dappIcon: string;
    dappName: string;
    Enhance?: {
        type: 'childRoutes';
        Content: React.ReactNode;
    }
}

const Navbar: React.FC<Props> = ({ handleSwitchLocale, handleSwitchMode, dappIcon, dappName, Enhance }) => {
    return (
        <nav className="h-[64px] flex-shrink-0">
            <div className="container h-full m-auto flex justify-between items-center whitespace-nowrap">
                <div className="flex items-center">
                    <img
                        className="mr-[4px] w-[24px] h-[24px]"
                        src={dappIcon}
                        alt="conflux-network icon"
                    />
                    <h4 className="flex items-center h-[22px] text-[16px] font-medium text-black">
                        {dappName}
                    </h4>
                    {Enhance?.type === 'childRoutes' && isValidElement(Enhance?.Content) && Enhance?.Content}
                </div>

                <div className="flex justify-center items-center">
                    <WalletConnector />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
