import Title from 'payment/src/components/Title';
import { Link } from 'react-router-dom';

export default () => {
    return (
        <div>
            <Title>Your APPs</Title>
            Your APPs page
            <Link to="/payment/provider/app/0x12345">app detail</Link>
        </div>
    );
};
