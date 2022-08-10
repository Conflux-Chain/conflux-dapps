import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Card } from 'antd';
import 'antd/dist/antd.css';

import APP from './Provider/APP';
import APPs from './Provider/APPs';
import Users from './Provider/Users';
import Setting from './Provider/Setting';
import Consumer from './Consumer';

export default () => {
    return (
        <Card>
            <Routes>
                {/* TODO need check account type is provider or consumer, then determine to direct to which entry */}
                <Route path="/" element={<Navigate to="provider/apps" />} />
                <Route path="/provider" element={<Navigate to="apps" />} />
                <Route path="/provider/apps" element={<APPs />} />
                <Route path="/provider/app/:appid/users" element={<Users />} />
                <Route path="/provider/app/:appid" element={<APP />} />
                <Route path="/provider/setting" element={<Setting />} />
                <Route path="/consumer" element={<Consumer />} />
                <Route path="*" element={<Navigate to="provider/apps" />} />
            </Routes>
            <Outlet />
        </Card>
    );
};
