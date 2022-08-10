import Title from 'payment/src/components/Title';
import { useParams } from 'react-router-dom';

export default () => {
    const { appid } = useParams();
    const config = [
        {
            text: 'Details',
            active: true,
        },
        {
            text: 'Users',
            link: `/payment/provider/app/${appid}/users`,
        },
    ];
    return (
        <div>
            <Title config={config} backTo="/payment/provider/apps"></Title>
            APP page, id: {appid}
        </div>
    );
};
