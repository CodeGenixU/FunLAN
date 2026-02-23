import { ImageMessage } from './ImageMessage';
import { VideoMessage } from './VideoMessage';
import { FileMessage } from './FileMessage';

interface ChatMessageProps {
    msg: any;
    isMyMessage: boolean;
    isConsecutive?: boolean;
}

export const ChatMessage = ({ msg, isMyMessage, isConsecutive = false }: ChatMessageProps) => {
    const isImage = msg.type === 'file' && !!msg.filename.match(/\.(jpeg|jpg|gif|png|webp)$/i);
    const isMedia = msg.type === 'file' && !!msg.filename.match(/\.(jpeg|jpg|gif|png|webp|mp4|webm|ogg)$/i);

    const renderContent = () => {
        if (msg.type === 'file') {
            if (isImage) {
                return <ImageMessage fileId={msg.file_id} filename={msg.filename} timestamp={msg.timestamp} />;
            }
            if (msg.filename.match(/\.(mp4|webm|ogg)$/i)) {
                return <VideoMessage fileId={msg.file_id} />;
            }
            return <FileMessage fileId={msg.file_id} filename={msg.filename} />;
        }

        return msg.message || msg.text;
    };

    return (
        <div className={`flex w-full ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[75%] ">
                {/* Show username ONLY for others, and not for consecutive messages */}
                {!isMyMessage && !isConsecutive && (
                    <span className="text-xs text-muted-foreground ml-2 mb-1 block">
                        {msg.username}
                    </span>
                )}

                <div
                    className={`
                        text-sm leading-relaxed shadow-sm
                        hover:bg-primary/90 transition duration-200
                        ${isMyMessage
                            ? `bg-primary text-primary-foreground rounded-2xl ${isConsecutive ? 'rounded-tr-md rounded-br-md' : 'rounded-br-md'}`
                            : `bg-white/10 text-foreground backdrop-blur-sm border border-white/5 rounded-2xl ${isConsecutive ? 'rounded-tl-md rounded-bl-md' : 'rounded-bl-md'}`}
                        ${isMedia && (!isImage) ? 'p-1' : (isImage ? 'p-0.5' : 'px-3 py-1.5')}
                    `}
                >
                    <div className={`flex items-end flex-wrap ${isImage ? '' : 'gap-2'}`}>
                        <div className="break-words min-w-0 flex-none w-full sm:w-auto text-white">
                            {renderContent()}
                        </div>
                        {!isImage && (
                            <div className={`text-[10px] leading-none shrink-0 ${isMyMessage ? 'text-muted-foreground' : 'text-muted-foreground'} ml-auto mb-0.5 mt-1`}>
                                {msg.timestamp}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
