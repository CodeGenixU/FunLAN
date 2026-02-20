import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useSocket } from './SocketContext';
import { useLocation } from 'react-router-dom';

export interface ChatData {
    id: number | string;
    roomId: string;
    name: string;
    path: string;
    lastMessage: string;
    time: string;
    unread: number;
    isCommon?: boolean;
}

interface ChatContextType {
    commonChat: ChatData;
    personalChats: ChatData[];
    clearUnread: (roomId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

// Initial mock data simulating what the Sidebar originally held.
const INITIAL_COMMON: ChatData = {
    id: 'global',
    roomId: 'global',
    name: 'Common Chat',
    path: '/common-chat',
    lastMessage: 'Welcome to General',
    time: '',
    unread: 0,
    isCommon: true
};

const INITIAL_PERSONAL: ChatData[] = [
    { id: 1, roomId: '1', name: 'Alice Smith', path: '/chat/1', lastMessage: 'See you later!', time: '10:30 AM', unread: 0 },
    { id: 2, roomId: '2', name: 'Bob Johnson', path: '/chat/2', lastMessage: 'Can you send me that file?', time: 'Yesterday', unread: 0 },
    { id: 3, roomId: '3', name: 'Charlie Brown', path: '/chat/3', lastMessage: 'Great idea!', time: 'Yesterday', unread: 0 },
];

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { socket } = useSocket();
    const location = useLocation();

    const [commonChat, setCommonChat] = useState<ChatData>(INITIAL_COMMON);
    const [personalChats, setPersonalChats] = useState<ChatData[]>(INITIAL_PERSONAL);

    // Provide an manual way to erase unread flags from UI actions
    const clearUnread = (roomId: string) => {
        if (roomId === 'global') {
            setCommonChat(prev => ({ ...prev, unread: 0 }));
        } else {
            setPersonalChats(prev => prev.map(chat =>
                chat.roomId === roomId ? { ...chat, unread: 0 } : chat
            ));
        }
    };

    // Auto-clear unread score if we navigate TO the route.
    useEffect(() => {
        if (location.pathname === '/common-chat') {
            clearUnread('global');
        } else if (location.pathname.startsWith('/chat/')) {
            const id = location.pathname.split('/')[2];
            clearUnread(id);
        }
    }, [location.pathname]);

    useEffect(() => {
        if (!socket) return;

        const handleIncoming = (room: string, messageText: string) => {
            // Compare room routing.
            // If the route matches the active user path perfectly, unread is technically 0.
            let isViewingRoom = false;
            if (room === 'global' && location.pathname === '/common-chat') {
                isViewingRoom = true;
            } else if (location.pathname === `/chat/${room}`) {
                isViewingRoom = true;
            }

            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (room === 'global') {
                setCommonChat(prev => ({
                    ...prev,
                    lastMessage: messageText,
                    time: timeString,
                    unread: isViewingRoom ? 0 : prev.unread + 1
                }));
            } else {
                setPersonalChats(prev => prev.map(chat => {
                    if (chat.roomId === room) {
                        return {
                            ...chat,
                            lastMessage: messageText,
                            time: timeString,
                            unread: isViewingRoom ? 0 : chat.unread + 1
                        };
                    }
                    return chat;
                }));
            }
        };

        const onMessage = (msg: any) => {
            const room = msg.room || 'global';
            // Determine preview text.
            let preview = msg.message || 'New message';
            if (msg.type === 'file') {
                preview = '📎 Attachment';
            }
            handleIncoming(room, preview);
        };

        const onFile = (fileData: any) => {
            const room = fileData.room || 'global';
            handleIncoming(room, '📎 Attachment');
        };

        socket.on('message', onMessage);
        socket.on('file', onFile);

        return () => {
            socket.off('message', onMessage);
            socket.off('file', onFile);
        };
    }, [socket, location.pathname]); // Hook onto location.pathname so isViewingRoom state uses latest scope in closure.

    return (
        <ChatContext.Provider value={{ commonChat, personalChats, clearUnread }}>
            {children}
        </ChatContext.Provider>
    );
};
