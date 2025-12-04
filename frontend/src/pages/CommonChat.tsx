import { useState, useRef } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Send, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';

const CommonChat = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                        #
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">General Room</h2>
                        <p className="text-xs text-muted-foreground">12 members online</p>
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

                {/* Received Message */}
                <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 shadow-sm" />
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold">Alice</span>
                            <span className="text-xs text-muted-foreground">10:30 AM</span>
                        </div>
                        <div className="p-3 bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl rounded-tl-none text-sm shadow-sm">
                            <p>Hey everyone! Welcome to the common chat.</p>
                        </div>
                    </div>
                </div>

                {/* Sent Message */}
                <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 shadow-sm" />
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-2 justify-end">
                            <span className="text-sm font-semibold">You</span>
                            <span className="text-xs text-muted-foreground">10:32 AM</span>
                        </div>
                        <div className="p-3 bg-primary text-primary-foreground rounded-2xl rounded-tr-none text-sm shadow-sm">
                            <p>Thanks! Excited to be here.</p>
                        </div>
                    </div>
                </div>
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
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground hover:bg-white/10"
                        onClick={triggerFileInput}
                    >
                        <Paperclip size={20} />
                    </Button>
                    <Input
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border-white/10 focus-visible:ring-1 focus-visible:ring-primary placeholder:text-muted-foreground/50"
                    />
                    <Button size="icon" className="rounded-full w-10 h-10 shadow-lg">
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CommonChat;
