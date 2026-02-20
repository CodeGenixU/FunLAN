
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/ui/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CommonChat from './pages/CommonChat';
import PersonalChat from './pages/PersonalChat';
import { SocketProvider } from './context/SocketContext';
import { MessageProvider } from './context/MessageContext';
import { ChatProvider } from './context/ChatContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRoute from './components/AuthRoute';
import { initTheme } from './lib/theme';

function App() {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <SocketProvider>
      <MessageProvider>
        <Router>
          <ChatProvider>
            <Layout>
              <Routes>
                <Route element={<AuthRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                  <Route path="/common-chat" element={<CommonChat />} />
                  <Route path="/chat/:id" element={<PersonalChat />} />
                </Route>

                <Route path="*" element={<Navigate to="/common-chat" replace />} />
              </Routes>
            </Layout>
            <ToastContainer position="top-right" autoClose={3000} />
          </ChatProvider>
        </Router>
      </MessageProvider>
    </SocketProvider>
  );
}

export default App;
