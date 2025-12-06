

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/ui/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CommonChat from './pages/CommonChat';
import PersonalChat from './pages/PersonalChat';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/common-chat" element={<CommonChat />} />
          <Route path="/chat/:id" element={<PersonalChat />} />
          <Route path="*" element={<Navigate to="/common-chat" replace />} />
        </Routes>
      </Layout>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
