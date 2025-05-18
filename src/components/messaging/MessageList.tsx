import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMessage } from '../../context/MessageContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './Messaging.css';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'owner' | 'tenant';
}

interface Property {
  id: string;
  title: string;
}

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  propertyId?: string;
  propertyTitle?: string;
}

const MessageList: React.FC = () => {
  const { user } = useAuth();
  const { messages, isLoading } = useMessage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Fetch users and properties from Firestore
  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(usersData);

        // Fetch properties
        const propertiesSnapshot = await getDocs(collection(db, 'properties'));
        const propertiesData = propertiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Property[];
        setProperties(propertiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create conversations from messages
  useEffect(() => {
    if (!user || !messages.length || users.length === 0) {
      setConversations([]);
      return;
    }

    // Map to keep track of the latest message for each user
    const conversationMap = new Map<string, Conversation>();

    // Process all messages to get conversations
    messages.forEach(message => {
      const isUserSender = message.senderId === user.id;
      const otherUserId = isUserSender ? message.receiverId : message.senderId;
      
      // Skip if we've already added a more recent message for this conversation
      if (
        conversationMap.has(otherUserId) &&
        conversationMap.get(otherUserId)!.lastMessageTime > message.createdAt
      ) {
        return;
      }

      // Find the other user's details
      const otherUser = users.find(u => u.id === otherUserId);
      if (!otherUser) return; // Skip if user not found

      // Find property details if applicable
      let propertyDetails = undefined;
      if (message.propertyId) {
        const property = properties.find(p => p.id === message.propertyId);
        if (property) {
          propertyDetails = {
            propertyId: property.id,
            propertyTitle: property.title,
          };
        }
      }

      // Count unread messages
      const unreadCount = messages.filter(
        msg => msg.senderId === otherUserId && msg.receiverId === user.id && !msg.read
      ).length;

      // Update conversation map
      conversationMap.set(otherUserId, {
        userId: otherUserId,
        userName: `${otherUser.firstName} ${otherUser.lastName}`,
        lastMessage: message.content,
        lastMessageTime: message.createdAt,
        unreadCount,
        ...propertyDetails,
      });
    });

    // Convert map to array and sort by latest message
    const sortedConversations = Array.from(conversationMap.values()).sort(
      (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
    );

    setConversations(sortedConversations);
  }, [messages, user, users, properties]);

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="bg-white p-4 shadow">
        <h2 className="text-xl font-semibold">Messages</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <Link
              to={`/messages/${conversation.userId}`}
              key={conversation.userId}
              className="flex items-start p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
            >
              <div className="flex-shrink-0 bg-primary-100 text-primary-800 rounded-full h-10 w-10 flex items-center justify-center font-medium">
                {conversation.userName.charAt(0)}
              </div>
              
              <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {conversation.userName}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatMessageTime(conversation.lastMessageTime)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                
                {conversation.propertyTitle && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {conversation.propertyTitle}
                    </span>
                  </div>
                )}
              </div>
              
              {conversation.unreadCount > 0 && (
                <div className="ml-2 bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {conversation.unreadCount}
                </div>
              )}
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
            <p className="text-gray-500 mt-1">Start a conversation with a property owner or tenant</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList; 