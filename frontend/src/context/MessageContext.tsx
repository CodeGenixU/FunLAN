import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useSocket } from './SocketContext';

interface MessageContextType {
    messagesByRoom: Record<string, any[]>;
    getMessages: (roomId: string) => any[];
    addMessage: (roomId: string, message: any) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessage = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessage must be used within a MessageProvider');
    }
    return context;
};

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { socket } = useSocket();
    const [messagesByRoom, setMessagesByRoom] = useState<Record<string, any[]>>({});

    const addMessage = (roomId: string, message: any) => {
        setMessagesByRoom((prev) => {
            const roomMessages = prev[roomId] || [];
            // Prevent duplicate message pushes if same message object somehow fired twice, though trust socket for now
            return {
                ...prev,
                [roomId]: [...roomMessages, message]
            };
        });
    };

    const getMessages = (roomId: string) => {
        return messagesByRoom[roomId] || [];
    };

    useEffect(() => {
        if (!socket) return;

        const processMessageRoom = (msgRoom: string, senderId?: string | number) => {
            const myUserId = localStorage.getItem('user_id');
            if (myUserId && msgRoom === `user:${myUserId}` && senderId) {
                // If it's a private message sent TO me, route it to the conversation window of the SENDER
                return `user:${senderId}`;
            }
            return msgRoom;
        };

        const handleMessage = (message: any) => {
            let room = message.room || 'global';
            room = processMessageRoom(room, message.user_id);
            addMessage(room, message);
        };

        const handleFile = (fileData: any) => {
            let room = fileData.room || 'global';
            room = processMessageRoom(room, fileData.user_id);
            addMessage(room, { ...fileData, type: 'file' });
        };

        socket.on('message', handleMessage);
        socket.on('file', handleFile);

        return () => {
            socket.off('message', handleMessage);
            socket.off('file', handleFile);
        };
    }, [socket]);

    return (
        <MessageContext.Provider value={{ messagesByRoom, getMessages, addMessage }}>
            {children}
        </MessageContext.Provider>
    );
};
