import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScreenSharePage from './components/ScreenSharePage';
import ConsumeScreenPage from './components/ConsumeScreenPage';
import { Provider } from 'react-redux';
import store from './redux/store';
import RealTimeForm from './components/monitor-screen';
import FormScreen from './components/form-screen';

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route path="/share" element={<ScreenSharePage />} />
                    <Route path="/consume" element={<ConsumeScreenPage />} />
                    <Route path="/monitor" element={<RealTimeForm />} />
                    <Route path="/form" element={<FormScreen />} />

                </Routes>
            </Router>
        </Provider>
    );
};

export default App;
