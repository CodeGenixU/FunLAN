import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useSocket } from './SocketContext';
import { useLocation } from 'react-router-dom';
import api from '../lib/axios';
import { toast } from 'react-toastify';

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

const INITIAL_PERSONAL: ChatData[] = [];

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { socket, isAuthenticated } = useSocket();
    const location = useLocation();

    const [commonChat, setCommonChat] = useState<ChatData>(INITIAL_COMMON);
    const [personalChats, setPersonalChats] = useState<ChatData[]>(INITIAL_PERSONAL);

    const formatUserChat = (user: { user_id: number; username: string }): ChatData => ({
        id: user.user_id,
        roomId: `user:${user.user_id}`,
        name: user.username,
        path: `/chat/user:${user.user_id}`,
        lastMessage: 'Start a chat',
        time: '',
        unread: 0
    });

    useEffect(() => {
        if (!isAuthenticated) return;

        const loadActiveUsers = async () => {
            try {
                const response = await api.get('/api/active-users');
                if (response.data.status === 'success') {
                    const activeUsers = response.data.data;
                    const myUserId = localStorage.getItem('user_id');

                    const chats = activeUsers
                        .filter((u: any) => String(u.user_id) !== String(myUserId))
                        .map(formatUserChat);

                    // Deduplicate by user_id
                    const uniqueChats = chats.filter((c: ChatData, index: number, self: ChatData[]) =>
                        index === self.findIndex((t: ChatData) => t.id === c.id)
                    );
                    setPersonalChats(uniqueChats);
                }
            } catch (err) {
                toast.error('Failed to load active users');
            }
        };

        loadActiveUsers();
    }, [isAuthenticated]);

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
            const id = location.pathname.replace('/chat/', '');
            clearUnread(id);
        }
    }, [location.pathname]);

    useEffect(() => {
        if (!socket) return;

        const handleUserJoined = (payload: any) => {
            if (payload.status === 'success') {
                const myUserId = localStorage.getItem('user_id');
                const user = payload.data;
                if (String(user.user_id) !== String(myUserId)) {
                    setPersonalChats(prev => {
                        // avoid duplicate
                        if (prev.find(c => String(c.id) === String(user.user_id))) return prev;
                        return [...prev, formatUserChat(user)];
                    });
                }
            }
        };

        const handleUserLeft = (payload: any) => {
            if (payload.status === 'success') {
                const user = payload.data;
                setPersonalChats(prev => prev.filter(c => String(c.id) !== String(user.user_id)));
            }
        };

        const processMessageRoom = (msgRoom: string, senderId?: string | number) => {
            const myUserId = localStorage.getItem('user_id');
            if (myUserId && msgRoom === `user:${myUserId}` && senderId) {
                // If it's a private message sent TO me, flag the unread on the sender's chat
                return `user:${senderId}`;
            }
            return msgRoom;
        };

        const handleIncoming = (room: string, messageText: string) => {
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
            let room = msg.room || 'global';
            room = processMessageRoom(room, msg.user_id);
            let preview = msg.message || 'New message';
            if (msg.type === 'file') {
                preview = '📎 Attachment';
            }
            handleIncoming(room, preview);
        };

        const onFile = (fileData: any) => {
            let room = fileData.room || 'global';
            room = processMessageRoom(room, fileData.user_id);
            handleIncoming(room, '📎 Attachment');
        };

        socket.on('user_joined', handleUserJoined);
        socket.on('disconnection_established', handleUserLeft);
        socket.on('message', onMessage);
        socket.on('file', onFile);

        return () => {
            socket.off('user_joined', handleUserJoined);
            socket.off('disconnection_established', handleUserLeft);
            socket.off('message', onMessage);
            socket.off('file', onFile);
        };
    }, [socket, location.pathname]);

    return (
        <ChatContext.Provider value={{ commonChat, personalChats, clearUnread }}>
            {children}
        </ChatContext.Provider>
    );
};
