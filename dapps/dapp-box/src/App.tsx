import CustomScrollbar from 'custom-react-scrollbar';
import Sidebar from "@modules/Sidebar";
import './App.css';
import 'common/index.css';

function App() {

    return (
        <>
            <Sidebar />
            <CustomScrollbar contentClassName='main-scroll'>
                
            </CustomScrollbar>
        </>
    );
}

export default App;
