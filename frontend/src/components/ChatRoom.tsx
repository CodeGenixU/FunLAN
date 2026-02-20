import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Send, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useMessage } from '../context/MessageContext';
import api from '../lib/axios';
import { ChatMessage } from './chat/ChatMessage';

interface ChatRoomProps {
    roomId: string;
    title: string;
    subtitle?: string;
    avatarInitials?: string;
}

const ChatRoom = ({ roomId, title, subtitle, avatarInitials = '#' }: ChatRoomProps) => {
    const { socket } = useSocket();
    const { getMessages } = useMessage();

    const messages = getMessages(roomId);

    const [inputMessage, setInputMessage] = useState('');
    const [username, setUsername] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        } else {
            setUsername(`Anonymous-${Math.floor(Math.random() * 1000)}`);
        }
    }, [roomId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (selectedFiles.length > 0) {
            for (const file of selectedFiles) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('room', roomId);
                formData.append('timestamp', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

                try {
                    await api.post('/api/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                } catch (error) {
                    console.error('Error uploading file:', error);
                }
            }
            setSelectedFiles([]);
        } else if (inputMessage.trim()) {
            const messageData = {
                room: roomId,
                username: username,
                message: inputMessage,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            socket?.emit('message', messageData);
            setInputMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col h-full w-full bg-transparent">
            {/* Chat Header */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                        {avatarInitials}
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">{title}</h2>
                        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* System Message */}
                <div className="flex justify-center">
                    <span className="bg-white/10 backdrop-blur-sm text-xs py-1 px-3 rounded-full text-muted-foreground border border-white/5">
                        Today
                    </span>
                </div>

                {messages.map((msg, index) => (
                    <ChatMessage
                        key={index}
                        msg={msg}
                        isMyMessage={msg.username === username}
                    />
                ))}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/5 backdrop-blur-md border-t border-white/10">
                {/* File Preview */}
                {selectedFiles.length > 0 && (
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="relative flex items-center gap-2 bg-white/10 p-2 rounded-md min-w-[150px] border border-white/5">
                                <div className="w-8 h-8 bg-background/50 rounded flex items-center justify-center text-muted-foreground">
                                    {file.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{file.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 hover:bg-destructive/90"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={handleFileSelect}
                        disabled={inputMessage.trim().length > 0}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground hover:bg-white/10 disabled:opacity-50"
                        onClick={triggerFileInput}
                        disabled={inputMessage.trim().length > 0}
                    >
                        <Paperclip size={20} />
                    </Button>
                    <Input
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border-white/10 focus-visible:ring-1 focus-visible:ring-primary placeholder:text-muted-foreground/50 disabled:opacity-50"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={selectedFiles.length > 0}
                    />
                    <Button size="icon" className="rounded-full w-10 h-10 shadow-lg text-foreground/90 hover:text-foreground" onClick={handleSendMessage}>
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
