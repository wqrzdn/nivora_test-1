import React from 'react';
import MessageList from './MessageList';
import NewMessageButton from './NewMessageButton';
import './Messaging.css';

const MessagesPage: React.FC = () => {
  return (
    <div className="messages-page-container">
      <div className="messages-page-header">
        <h1>Messages</h1>
        <NewMessageButton />
      </div>
      <MessageList />
    </div>
  );
};

export default MessagesPage; 