import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMessage } from '../../context/MessageContext';
import { Trash2 } from 'lucide-react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Property {
  id: string;
  title: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
}

const MessageWindow: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    getConversation, 
    markAsRead, 
    deleteMessage 
  } = useMessage();
  
  const [newMessage, setNewMessage] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isPropertyLoading, setIsPropertyLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get conversation partner info
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      setIsUserLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          setOtherUser({
            id: userDoc.id,
            ...userDoc.data() as Omit<User, 'id'>
          });
        } else {
          console.error('User not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsUserLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Get available properties
  useEffect(() => {
    const fetchProperties = async () => {
      setIsPropertyLoading(true);
      try {
        // If the current user is an owner, fetch their properties
        // If they're a tenant, fetch all properties
        let propertiesQuery;
        if (user?.userType === 'owner') {
          propertiesQuery = query(
            collection(db, 'properties'),
            where('ownerId', '==', user.id)
          );
        } else {
          propertiesQuery = collection(db, 'properties');
        }
        
        const propertiesSnapshot = await getDocs(propertiesQuery);
        const propertiesData = propertiesSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
        }));
        
        setProperties(propertiesData);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setIsPropertyLoading(false);
      }
    };

    if (user) {
      fetchProperties();
    }
  }, [user]);

  // Mark unread messages as read
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!user || !userId) return;
      
      const conversation = getConversation(user.id, userId);
      const unreadMessages = conversation.filter(
        msg => msg.senderId === userId && msg.receiverId === user.id && !msg.read
      );
      
      // Mark each unread message as read
      for (const message of unreadMessages) {
        await markAsRead(message.id);
      }
    };
    
    markMessagesAsRead();
  }, [user, userId, messages, markAsRead, getConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get conversation
  const conversation = user && userId ? getConversation(user.id, userId) : [];

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !userId || !newMessage.trim()) return;
    
    // Clear previous errors
    setMessageError(null);
    setSendingMessage(true);
    
    try {
      // Check if the participants collection field exists in the message document
      // This is a common issue that can cause messages to fail
      // Only include propertyId if it's a non-empty string
      const messageData = {
        senderId: user.id,
        receiverId: userId,
        content: newMessage.trim(),
      };
      
      // Only add propertyId if it's a non-empty string
      if (selectedProperty && selectedProperty.trim() !== '') {
        // @ts-ignore - We're explicitly checking that it's a non-empty string
        messageData.propertyId = selectedProperty;
      }
      
      console.log('Sending message with data:', messageData);
      await sendMessage(messageData);
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageError('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle message deletion
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Format message time
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Loading state
  if (isLoading || isUserLoading || isPropertyLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-red-500 p-4">
        <p>Error loading messages: {error}</p>
      </div>
    );
  }

  // No user selected
  if (!userId || !otherUser) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-500 p-4">
        <p>Select a conversation to start messaging</p>
      </div>
    );
  }

  // No user logged in
  if (!user) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-500 p-4">
        <p>You must be logged in to send messages</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with user name */}
      <div className="bg-white p-4 shadow flex items-center">
        <div className="flex-shrink-0 bg-primary-100 text-primary-800 rounded-full h-10 w-10 flex items-center justify-center font-medium mr-3">
          {otherUser.firstName.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {otherUser.firstName} {otherUser.lastName}
          </h2>
          <p className="text-sm text-gray-500">{otherUser.userType}</p>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {conversation.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Send a message to start the conversation.</p>
          </div>
        ) : (
          conversation.map((message) => {
            const isCurrentUser = message.senderId === user.id;
            
            return (
              <div 
                key={message.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser 
                      ? 'bg-primary-100 text-primary-900' 
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    {isCurrentUser && (
                      <button 
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Delete message"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 flex justify-between">
                    <span>{formatMessageTime(message.createdAt)}</span>
                    {message.propertyId && (
                      <span className="ml-2">
                        {properties.find(p => p.id === message.propertyId)?.title || 'Property'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Property selector */}
          {properties.length > 0 && (
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            >
              <option value="">No property selected</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title}
                </option>
              ))}
            </select>
          )}
          
          {/* Error message display */}
          {messageError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-3 text-sm">
              {messageError}
            </div>
          )}
          
          {/* Message input and send button */}
          <div className="flex items-end gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 min-h-[80px] resize-none"
              disabled={sendingMessage}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sendingMessage}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {sendingMessage ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageWindow; 