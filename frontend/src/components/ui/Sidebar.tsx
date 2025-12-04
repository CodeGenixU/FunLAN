import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, Hash } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { ColorPicker } from './ColorPicker';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
    const location = useLocation();

    const personalChats = [
        { id: 1, name: 'Alice Smith', path: '/chat/1', lastMessage: 'See you later!', time: '10:30 AM', unread: 2 },
        { id: 2, name: 'Bob Johnson', path: '/chat/2', lastMessage: 'Can you send me that file?', time: 'Yesterday', unread: 0 },
        { id: 3, name: 'Charlie Brown', path: '/chat/3', lastMessage: 'Great idea!', time: 'Yesterday', unread: 0 },
    ];

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
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hover:bg-primary/10"
                    >
                        <Menu size={20} className="text-primary" />
                    </Button>
                    {!isCollapsed && <h1 className="font-bold text-lg tracking-tight">FunLan</h1>}
                </div>
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link to="/login">
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <LogOut size={20} />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Navigation List */}
            <div className="flex-1 overflow-y-auto">
                {/* Common Chat */}
                <Link
                    to="/common-chat"
                    className={cn(
                        "flex items-center gap-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5",
                        isCollapsed ? "justify-center px-2" : "px-4",
                        location.pathname === '/common-chat' && "bg-primary/5 border-l-4 border-l-primary"
                    )}
                    title={isCollapsed ? "Common Chat" : undefined}
                >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-inner">
                        <Hash size={24} className="text-primary" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-semibold text-base">Common Chat</h3>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                                General Room
                            </p>
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
                                            {chat.lastMessage}
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

            {/* Footer Actions */}
            <div className={cn(
                "p-4 border-t border-white/10 bg-white/5 backdrop-blur-md flex flex-col gap-4",
                isCollapsed ? "items-center" : ""
            )}>
                {!isCollapsed && (
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Theme Color</span>
                        <ColorPicker />
                    </div>
                )}
                {isCollapsed && (
                    <div className="flex flex-col gap-3">
                        <ThemeToggle />
                        <Link to="/login">
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <LogOut size={20} />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
};
