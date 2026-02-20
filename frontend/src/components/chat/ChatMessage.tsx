import { ImageMessage } from './ImageMessage';
import { VideoMessage } from './VideoMessage';
import { FileMessage } from './FileMessage';

interface ChatMessageProps {
    msg: any;
    isMyMessage: boolean;
}

export const ChatMessage = ({ msg, isMyMessage }: ChatMessageProps) => {
    const renderContent = () => {
        if (msg.type === 'file') {
            if (msg.filename.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                return <ImageMessage fileId={msg.file_id} filename={msg.filename} />;
            }
            if (msg.filename.match(/\.(mp4|webm|ogg)$/i)) {
                return <VideoMessage fileId={msg.file_id} />;
            }
            return <FileMessage fileId={msg.file_id} filename={msg.filename} />;
        }

        return msg.message || msg.text;
    };

    const isMedia = msg.type === 'file' && msg.filename.match(/\.(jpeg|jpg|gif|png|webp|mp4|webm|ogg)$/i);

    return (
        <div className={`flex w-full ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[75%] ">
                {/* Show username ONLY for others */}
                {!isMyMessage && (
                    <span className="text-xs text-muted-foreground ml-2 mb-1 block">
                        {msg.username}
                    </span>
                )}

                <div
                    className={`
                        text-sm leading-relaxed shadow-sm
                        hover:bg-primary/90 transition duration-200
                        ${isMyMessage
                            ? 'bg-primary rounded-2xl rounded-br-md'
                            : 'bg-white/10 backdrop-blur-sm border border-white/5 rounded-2xl rounded-bl-md'}
                        ${isMedia ? 'p-1' : 'px-4 py-2'}
                    `}
                >
                    {renderContent()}
                </div>

                {/* Timestamp subtle + aligned */}
                <div
                    className={`text-[10px] mt-1 text-muted-foreground ${isMyMessage ? 'text-right mr-1' : 'text-left ml-1'
                        }`}
                >
                    {msg.timestamp}
                </div>
            </div>
        </div>
    );
};
