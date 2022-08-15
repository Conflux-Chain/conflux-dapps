import Title from 'payment/src/components/Title';
import { useParams } from 'react-router-dom';

export default () => {
    const { address } = useParams();
    const config = [
        {
            text: 'Detail',
            link: `/payment/provider/app/${address}`,
        },
        {
            text: 'Users',
            active: true,
        },
    ];

    return (
        <div>
            <Title config={config} backTo="/payment/provider/apps"></Title>
            Users page
        </div>
    );
};
