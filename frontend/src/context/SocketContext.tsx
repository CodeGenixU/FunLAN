
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    isAuthenticated: boolean;
    isConnecting: boolean;
    connectSocket: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

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
    const [isConnecting, setIsConnecting] = useState(true);

    const connectSocket = () => {
        setIsConnecting(true);
        if (socket) {
            socket.disconnect();
        }

        const socketInstance = io('/socket.io/', {
            withCredentials: true,
            autoConnect: false
        });

        socketInstance.on('connect_error', (err) => {
            console.error('Socket connect error:', err);
            setIsAuthenticated(false);
            setIsConnecting(false);
        });

        socketInstance.on('user_joined', (data) => {
            if (data.status === 'success') {
                setIsAuthenticated(true);
                setIsConnecting(false);
                setIsConnected(true);
            }
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
            // We do not immediately set unauth if it's just a transient disconnect
        });

        setSocket(socketInstance);
        socketInstance.connect();

        return socketInstance;
    };

    useEffect(() => {
        const socketInstance = connectSocket();

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, isAuthenticated, isConnecting, connectSocket }}>
            {children}
        </SocketContext.Provider>
    );
};
