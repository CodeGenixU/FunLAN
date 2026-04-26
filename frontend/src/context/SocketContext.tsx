
import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../lib/axios';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    isAuthenticated: boolean;
    isConnecting: boolean;
    connectSocket: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [wasAuthenticated, setWasAuthenticated] = useState(false);

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error('Logout error:', e);
        }
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        window.location.href = '/login';
    };

    const connectSocket = () => {
        setIsConnecting(true);
        if (socket) {
            socket.disconnect();
        }

        const socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
            withCredentials: true,
            autoConnect: false,
            // transports: ['websocket'],
        });

        socketInstance.on('connect_error', (err) => {
            console.error('Socket connect error:', err);
            setIsAuthenticated(false);
            setIsConnecting(false);
            // If connect error and was authenticated, logout
            if (wasAuthenticated) {
                logout();
            }
        });

        socketInstance.on('user_joined', (data) => {
            if (data.status === 'success') {
                setIsAuthenticated(true);
                setWasAuthenticated(true);
                setIsConnecting(false);
                setIsConnected(true);
            }
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
            // If disconnected and was authenticated, logout (forceful disconnect)
            if (wasAuthenticated) {
                setWasAuthenticated(false);
                logout();
            }
        });

        setSocket(socketInstance);
        socketInstance.connect();

        return socketInstance;
    };

    // Remove automatic connection on mount
    // useEffect(() => {
    //     const socketInstance = connectSocket();
    //     return () => {
    //         socketInstance.disconnect();
    //     };
    // }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, isAuthenticated, isConnecting, connectSocket }}>
            {children}
        </SocketContext.Provider>
    );
};
