import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  propertyId?: string;
  read: boolean;
  createdAt: Date;
}

interface MessageContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: Omit<Message, 'id' | 'read' | 'createdAt'>) => Promise<Message>;
  getMessagesByUser: (userId: string) => Message[];
  getConversation: (user1Id: string, user2Id: string) => Message[];
  markAsRead: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  getUnreadCount: (userId: string) => number;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Subscribe to messages from Firestore
  useEffect(() => {
    if (!user) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null); // Reset error state
    
    try {
      console.log('Fetching messages for user:', user.id, 'type:', user.userType);
      
      const messagesQuery = query(
        collection(db, 'messages'),
        where('participants', 'array-contains', user.id)
      );
      
      console.log(`Created messages query for user: ${user.id}`);

      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          try {
            console.log(`Received ${snapshot.docs.length} messages from Firestore`);
            
            if (snapshot.empty) {
              console.log('No messages found for this user');
              setMessages([]);
              setIsLoading(false);
              return;
            }
            
            const messageData: Message[] = [];
            
            snapshot.docs.forEach(doc => {
              try {
                const data = doc.data();
                
                if (!data.senderId || !data.receiverId || !data.content || !data.createdAt) {
                  console.warn(`Message ${doc.id} has missing required fields, skipping`);
                  return;
                }
                
                let createdAtDate: Date;
                try {
                  createdAtDate = data.createdAt.toDate();
                } catch (dateError) {
                  console.warn(`Invalid date in message ${doc.id}, using current date`);
                  createdAtDate = new Date();
                }
                
                messageData.push({
                  id: doc.id,
                  senderId: data.senderId,
                  receiverId: data.receiverId,
                  content: data.content,
                  propertyId: data.propertyId || undefined,
                  read: data.read || false,
                  createdAt: createdAtDate,
                });
              } catch (docError) {
                console.error(`Error processing message document ${doc.id}:`, docError);
              }
            });
            
            messageData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            
            console.log(`Successfully processed ${messageData.length} valid messages`);
            setMessages(messageData);
            setError(null);
          } catch (parseError) {
            console.error('Error parsing message data:', parseError);
            setError('Error processing message data');
          } finally {
            setIsLoading(false);
          }
        },
        (err) => {
          console.error('Error fetching messages:', err);
          setError(`Failed to load messages: ${err.message}`);
          setIsLoading(false);
        }
      );
      
      return () => {
        console.log('Unsubscribing from messages listener');
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up messages listener:', error);
      setError('Failed to initialize messages');
      setIsLoading(false);
      return () => {};
    }
  }, [user]);

  const sendMessage = async (
    messageData: Omit<Message, 'id' | 'read' | 'createdAt'>
  ): Promise<Message> => {
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error('User must be logged in to send messages');
      }
      
      // Ensure we have both sender and receiver IDs
      if (!messageData.senderId || !messageData.receiverId) {
        throw new Error('Both sender and receiver IDs are required');
      }
      
      console.log('Attempting to send message with data:', {
        ...messageData,
        participants: [messageData.senderId, messageData.receiverId]
      });
      
      // Create message document data with required fields
      const messageDocData: any = {
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        content: messageData.content,
        read: false,
        createdAt: Timestamp.now(),
        // Ensure participants array is properly set for querying
        participants: [messageData.senderId, messageData.receiverId],
      };
      
      // Only add propertyId if it exists and is not undefined
      if (messageData.propertyId && typeof messageData.propertyId === 'string' && messageData.propertyId.trim() !== '') {
        messageDocData.propertyId = messageData.propertyId;
      }
      
      console.log('Final message document data:', messageDocData);
      
      // Create a new message document
      const messageRef = await addDoc(collection(db, 'messages'), messageDocData);
      
      console.log('Message sent successfully with ID:', messageRef.id);
      
      const newMessage: Message = {
        ...messageData,
        id: messageRef.id,
        read: false,
        createdAt: new Date(),
      };
      
      // Don't add the message to local state immediately - let the Firestore listener handle it
      // This prevents duplicate messages from appearing temporarily
      // The onSnapshot listener will automatically update the UI when the message is added to Firestore
      
      return newMessage;
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw new Error(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessagesByUser = (userId: string): Message[] => {
    return messages.filter(
      msg => msg.senderId === userId || msg.receiverId === userId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const getConversation = (user1Id: string, user2Id: string): Message[] => {
    return messages.filter(
      msg =>
        (msg.senderId === user1Id && msg.receiverId === user2Id) ||
        (msg.senderId === user2Id && msg.receiverId === user1Id)
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  };

  const markAsRead = async (messageId: string) => {
    setIsLoading(true);
    
    try {
      // First, get the message to check if the current user is a participant
      const messageRef = doc(db, 'messages', messageId);
      
      // Add error handling and logging
      console.log(`Attempting to mark message ${messageId} as read`);
      
      // Update the message with read status
      await updateDoc(messageRef, { 
        read: true,
        updatedAt: new Date() // Add a timestamp to track when it was read
      });
      
      console.log(`Successfully marked message ${messageId} as read`);
      
      // Update the local state to reflect the change
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
    } catch (err) {
      console.error('Failed to mark message as read:', err);
      // More detailed error logging
      if (err instanceof Error) {
        console.error('Error details:', err.message);
      }
      setError('Failed to mark message as read');
      // Don't throw the error - just log it to prevent UI disruption
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = async (messageId: string): Promise<void> => {
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError('Failed to delete message');
      throw new Error('Failed to delete message');
    } finally {
      setIsLoading(false);
    }
  };

  const getUnreadCount = (userId: string): number => {
    return messages.filter(msg => msg.receiverId === userId && !msg.read).length;
  };

  const value = {
    messages,
    isLoading,
    error,
    sendMessage,
    getMessagesByUser,
    getConversation,
    markAsRead,
    deleteMessage,
    getUnreadCount,
  };

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
}; 