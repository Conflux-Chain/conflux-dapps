import Title from 'payment/src/components/Title';
import { useParams, useLocation } from 'react-router-dom';
import BillingSettings from 'payment/src/modules/Provider/APP/BillingSettings';
import Detail from 'payment/src/modules/Common/APP/Detail';

export default () => {
    const { address } = useParams();
    const { state } = useLocation();

    return (
        <div>
            <Title backTo={`/payment/consumer/${(state as { from: string })?.from || 'apps'}`}>Detail</Title>
            <Detail address={address as string} />
            <BillingSettings address={address as string} />
        </div>
    );
};
