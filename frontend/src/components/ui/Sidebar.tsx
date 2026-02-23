import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Menu, Hash, LogOut, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { ColorPicker } from './ColorPicker';
import { useChat } from '../../context/ChatContext';
import api from '../../lib/axios';
import { toast } from 'react-toastify';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'chats' | 'settings'>('chats');
    const { commonChat, personalChats, typingUsers } = useChat();

    return (
        <aside
            className={cn(
                "border-r border-white/10 flex flex-col bg-card/30 backdrop-blur-xl transition-all duration-300 ease-in-out z-20 shadow-xl",
                isCollapsed ? "w-[80px]" : "w-[400px]"
            )}
        >
            {/* Header */}
            <div className={cn(
                "h-16 flex items-center bg-white/5 border-b border-white/10 transition-all duration-300",
                isCollapsed ? "justify-center px-0" : "justify-between px-4"
            )}>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setIsCollapsed(!isCollapsed)
                            setActiveTab('chats')
                        }}
                        className="hover:bg-primary/10"
                    >
                        <Menu size={20} className="text-primary" />
                    </Button>
                    {!isCollapsed && <h1 className="font-bold text-lg tracking-tight">FunLan</h1>}
                </div>
                {!isCollapsed && <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "transition-colors hover:bg-white/10 hover:text-primary",
                        activeTab === 'settings' && "bg-white/10 text-primary"
                    )}
                    onClick={() => activeTab === 'settings' ? setActiveTab('chats') : setActiveTab('settings')}
                    title={activeTab === 'settings' ? 'Close' : 'Settings'}
                >
                    <div
                        className={cn(
                            "transition-transform duration-300",
                            activeTab === "settings" ? "rotate-90" : "rotate-0"
                        )}
                    >
                        {activeTab === 'settings' ? <X className='' size={20} /> : <Settings className='' size={20} />}
                    </div>

                </Button>}
            </div>
            {/* Navigation List or Settings Tab */}
            <div className="flex-1 overflow-hidden relative">
                {/* Chats Panel */}
                <div
                    className={cn(
                        "absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        activeTab === "chats"
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-4 pointer-events-none"
                    )}
                >
                    <div className="h-full overflow-y-auto flex flex-col">
                        {/* Common Chat */}
                        <Link
                            to={commonChat.path}
                            className={cn(
                                "flex items-center gap-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 relative",
                                isCollapsed ? "justify-center px-2" : "px-4",
                                location.pathname === commonChat.path && "bg-primary/5 border-l-4 border-l-primary"
                            )}
                            title={isCollapsed ? commonChat.name : undefined}
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-inner relative">
                                <Hash size={24} className="text-primary" />
                                {isCollapsed && commonChat.unread > 0 && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center border-2 border-card shadow-sm">
                                        {commonChat.unread}
                                    </div>
                                )}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0 mr-2">
                                            <h3 className="font-semibold text-base truncate leading-tight">
                                                {commonChat.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {typingUsers?.['global']?.length ? (
                                                    <span className="text-primary italic animate-pulse">
                                                        {typingUsers['global'].length > 1
                                                            ? 'several people typing...'
                                                            : `${typingUsers['global'][0]} is typing...`}
                                                    </span>
                                                ) : (
                                                    commonChat.lastMessage
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            <span className="text-[10px] font-medium text-muted-foreground/80 whitespace-nowrap">{commonChat.time}</span>
                                            {commonChat.unread > 0 && (
                                                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                                                    {commonChat.unread}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Link>

                        {/* Separator */}
                        {!isCollapsed && (
                            <div className="px-4 py-4 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">
                                Direct Messages
                            </div>
                        )}
                        {isCollapsed && <div className="h-px bg-white/10 my-2 mx-4" />}

                        {/* Personal Chats */}
                        {personalChats.map((chat) => (
                            <Link
                                key={chat.id}
                                to={chat.path}
                                className={cn(
                                    "flex items-center gap-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5",
                                    isCollapsed ? "justify-center px-2" : "px-4",
                                    location.pathname === chat.path && "bg-primary/5 border-l-4 border-l-primary"
                                )}
                                title={isCollapsed ? chat.name : undefined}
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0 relative shadow-sm border border-white/10">
                                    {chat.name[0]}
                                    {isCollapsed && chat.unread > 0 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center border-2 border-card shadow-sm">
                                            {chat.unread}
                                        </div>
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0 mr-2">
                                                <h3 className="font-semibold text-base truncate leading-tight">
                                                    {chat.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {typingUsers?.[chat.roomId]?.length ? (
                                                        <span className="text-primary italic animate-pulse">Typing...</span>
                                                    ) : (
                                                        chat.lastMessage
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                <span className="text-[10px] font-medium text-muted-foreground/80 whitespace-nowrap">{chat.time}</span>
                                                {chat.unread > 0 && (
                                                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                                                        {chat.unread}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Link>
                        ))}

                    </div>
                </div>
                <div
                    className={cn(
                        "absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        activeTab === "settings"
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 translate-x-4 pointer-events-none"
                    )}
                >
                    <div className="h-full overflow-y-auto p-4 flex flex-col gap-6">
                        <div className="flex-1 p-4 w-full flex flex-col gap-6">
                            <div className="space-y-4">
                                {!isCollapsed && <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Appearance</h3>}

                                <div className={cn(
                                    "flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5",
                                    isCollapsed && "flex-col gap-4"
                                )}>
                                    {!isCollapsed && <span className="font-medium text-sm">Dark Mode</span>}
                                    <ThemeToggle />
                                </div>

                                <div className={cn(
                                    "bg-white/5 p-4 rounded-xl border border-white/5",
                                    isCollapsed ? "flex flex-col items-center gap-4" : "space-y-3"
                                )}>
                                    {!isCollapsed && <span className="font-medium text-sm block">Accent Color</span>}
                                    <ColorPicker />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/10 mt-auto">
                                {!isCollapsed && <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</h3>}

                                <Button
                                    variant="destructive"
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 rounded-xl",
                                        isCollapsed && "px-0"
                                    )}
                                    onClick={async () => {
                                        try {
                                            await api.post('/api/logout');
                                        } catch (e) {
                                            toast.error("Logout error");
                                            console.error(e);
                                        }
                                        localStorage.removeItem('user_id');
                                        localStorage.removeItem('username');
                                        window.location.href = '/login';
                                    }}
                                >
                                    <LogOut size={18} />
                                    {!isCollapsed && <span>Log Out</span>}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </aside>
    );
};
