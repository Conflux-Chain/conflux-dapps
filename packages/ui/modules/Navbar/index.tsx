import React from 'react';
import Conflux from '../../assets/Conflux.svg';
import WalletConnector from './WalletConnector';
import './index.css';

interface Props {
    handleSwitchLocale?: () => void;
    handleSwitchMode?: () => void;
}

const Navbar: React.FC<Props> = ({ handleSwitchLocale, handleSwitchMode }) => {
    return (
        <nav className="h-[64px]">
            <div className="container h-full m-auto flex justify-between items-center whitespace-nowrap">
                <div className="flex items-center">
                    <img
                        className="mr-[4px] w-[24px] h-[24px]"
                        src={Conflux}
                        alt="conflux-network icon"
                    />
                    <h4 className="flex items-center h-[22px] text-[16px] font-medium text-black">
                        Conflux Network
                    </h4>
                </div>

                <div className="flex justify-center items-center">
                    <WalletConnector />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
