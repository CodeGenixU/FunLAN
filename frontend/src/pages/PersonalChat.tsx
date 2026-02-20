import { useParams } from 'react-router-dom';
import ChatRoom from '../components/ChatRoom';

const PersonalChat = () => {
    const { id } = useParams();

    return (
        <ChatRoom
            roomId={id || 'unknown'}
            title="Direct Message"
            subtitle="Online"
            avatarInitials="A"
        />
    );
};

export default PersonalChat;
