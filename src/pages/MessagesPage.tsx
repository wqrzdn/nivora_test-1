import React from 'react';
import { useParams } from 'react-router-dom';
import MessagesLayout from '../components/messaging/MessagesPage';
import MessageWindow from '../components/messaging/MessageWindow';

const MessagesPage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();

  return (
    <div className="messages-page-wrapper">
      {userId ? (
        <MessageWindow />
      ) : (
        <MessagesLayout />
      )}
    </div>
  );
};

export default MessagesPage; 