import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMessage } from '../../context/MessageContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './Messaging.css';

interface MessageNotificationState {
  isVisible: boolean;
  sender: string;
  content: string;
  messageId: string;
}

const MessageNotification: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, markAsRead } = useMessage();
  const [notification, setNotification] = useState<MessageNotificationState>({
    isVisible: false,
    sender: '',
    content: '',
    messageId: ''
  });

  useEffect(() => {
    if (!user) return;

    // Check for new messages
    const unreadMessages = messages.filter(msg => 
      msg.receiverId === user.id && !msg.read
    );

    if (unreadMessages.length > 0) {
      // Take the most recent unread message
      const latestMessage = unreadMessages.reduce((latest, current) => 
        current.createdAt > latest.createdAt ? current : latest
      );

      // Get sender info from Firestore
      const fetchSenderInfo = async () => {
        try {
          const senderDoc = await getDoc(doc(db, 'users', latestMessage.senderId));
          
          if (senderDoc.exists()) {
            const senderData = senderDoc.data();
            const senderName = `${senderData.firstName} ${senderData.lastName}`;
            
            // Show notification
            setNotification({
              isVisible: true,
              sender: senderName,
              content: latestMessage.content.length > 50 
                ? `${latestMessage.content.substring(0, 50)}...` 
                : latestMessage.content,
              messageId: latestMessage.id
            });
          } else {
            // Fallback if user not found
            setNotification({
              isVisible: true,
              sender: 'Unknown User',
              content: latestMessage.content.length > 50 
                ? `${latestMessage.content.substring(0, 50)}...` 
                : latestMessage.content,
              messageId: latestMessage.id
            });
          }
          
          // Auto-hide notification after 5 seconds
          const timer = setTimeout(() => {
            setNotification(prev => ({ ...prev, isVisible: false }));
          }, 5000);
          
          return () => clearTimeout(timer);
        } catch (error) {
          console.error('Error fetching sender info:', error);
        }
      };
      
      fetchSenderInfo();
    }
  }, [user, messages]);

  const handleClick = async () => {
    // Mark the message as read
    if (notification.messageId) {
      await markAsRead(notification.messageId);
    }
    
    // Find the message to get the sender ID
    const message = messages.find(msg => msg.id === notification.messageId);
    if (message) {
      // Navigate to the conversation
      navigate(`/messages/${message.senderId}`);
    }
    
    // Hide notification
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  if (!notification.isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm cursor-pointer z-50"
      onClick={handleClick}
    >
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <strong className="text-gray-900">New message from {notification.sender}</strong>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={handleClose}
          >
            &times;
          </button>
        </div>
        <div className="text-gray-700">
          {notification.content}
        </div>
      </div>
    </div>
  );
};

export default MessageNotification; 