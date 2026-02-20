import { Navigate, Outlet } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
    const { isAuthenticated, isConnecting } = useSocket();

    if (isConnecting) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
