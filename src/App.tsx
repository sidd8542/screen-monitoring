import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import ScreenSharePage from './components/ScreenSharePage';
// import ConsumeScreenPage from './components/ConsumeScreenPage';
import { Provider } from 'react-redux';
import store from './redux/store';
import RealTimeForm from './components/monitor-screen';
import FormScreen from './components/form-screen';
// import CanvasStreamForm from './components/CanvasStream';
// import CreateSession from './components/CreateSession';
// import MonitorSession from './components/MonitorSession';

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    {/* <Route path="/share" element={<ScreenSharePage />} />
                    <Route path="/consume" element={<ConsumeScreenPage />} /> */}
                    <Route path="/monitor" element={<RealTimeForm />} />
                    <Route path="/" element={<FormScreen />} />
                    {/* <Route path="session/:sessionId" element={<MonitorSession />} />
                    <Route path="/session" element={<CreateSession />} /> */}
                    {/* <Route path="/canvas" element={<CanvasStreamForm />} /> */}
                </Routes>
            </Router>
        </Provider>
    );
};

export default App;
