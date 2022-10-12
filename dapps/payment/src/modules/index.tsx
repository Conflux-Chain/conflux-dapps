import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Card } from 'antd';
import 'antd/dist/antd.css';

import APP from './Common/APP';
import APPs from './Provider/APPs';
import Users from './Provider/Users';
import Setting from './Provider/Setting';
import ConsumerAPPs from './Consumer/APPs';
import ConsumerPaidAPPs from './Consumer/PaidAPPs';
import ScrollToTop from 'payment/src/components/ScrollToTop';

export default () => {
    return (
        <ScrollToTop>
            <Card>
                <Routes>
                    <Route path="/" element={<Navigate to="provider/apps" />} />
                    <Route path="/provider" element={<Navigate to="apps" />} />
                    <Route path="/provider/apps" element={<APPs />} />
                    <Route path="/provider/app/:address/users" element={<Users />} />
                    <Route path="/provider/app/:address" element={<APP />} />
                    <Route path="/provider/app/:type/:address" element={<APP />} />
                    <Route path="/provider/setting" element={<Setting />} />
                    <Route path="/consumer" element={<Navigate to="paid-apps" />} />
                    <Route path="/consumer/apps" element={<ConsumerAPPs />} />
                    <Route path="/consumer/paid-apps" element={<ConsumerPaidAPPs />} />
                    <Route path="/consumer/app/:address" element={<APP />} />
                    <Route path="*" element={<Navigate to="provider/apps" />} />
                </Routes>
                <Outlet />
            </Card>
        </ScrollToTop>
    );
};
