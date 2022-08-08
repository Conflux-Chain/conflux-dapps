import React, { useEffect } from 'react';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { Outlet, Link, useLocation } from 'react-router-dom';
import cx from 'clsx';
import Spin from 'common/components/Spin';

export default () => {
    return (
        <div className="mx-auto w-[1140px] pt-[16px]">
            payment provider page
            <Outlet />
        </div>
    );
};
