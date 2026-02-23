import { useParams } from 'react-router-dom';
import ChatRoom from '../components/ChatRoom';
import { useChat } from '../context/ChatContext';

const PersonalChat = () => {
    const { id } = useParams();
    const { personalChats } = useChat();
    const chat = personalChats.find((chat) => chat.roomId === id);
    return (
        <ChatRoom
            roomId={id || 'unknown'}
            title={chat?.name || 'Direct Message'}
            subtitle="Online"
            avatarInitials={chat?.name.charAt(0).toUpperCase() || 'A'}
        />
    );
};

export default PersonalChat;
