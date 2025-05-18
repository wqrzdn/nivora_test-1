import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  onSnapshot,
  serverTimestamp,
  where // Keep this import as it might be needed in the future
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

export interface Comment {
  id: string;
  propertyId: string;
  userId: string;
  content: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CommentContextType {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Comment>;
  updateComment: (id: string, content: string, rating?: number) => Promise<Comment>;
  deleteComment: (id: string) => Promise<void>;
  getCommentsByProperty: (propertyId: string) => Comment[];
  getCommentsByUser: (userId: string) => Comment[];
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export const CommentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Subscribe to comments from Firestore
  useEffect(() => {
    if (!user) {
      setComments([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null); // Reset error state
    
    try {
      console.log('Fetching comments for user type:', user.userType);
      
      // Query all comments, ordered by creation date
      const commentsQuery = query(
        collection(db, 'comments'),
        orderBy('createdAt', 'desc')
      );

      // Real-time listener for comments
      const unsubscribe = onSnapshot(
        commentsQuery,
        (snapshot) => {
          try {
            console.log(`Received ${snapshot.docs.length} comments from Firestore`);
            const commentData: Comment[] = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                propertyId: data.propertyId,
                userId: data.userId,
                content: data.content,
                rating: data.rating,
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
              };
            });
            
            setComments(commentData);
            setError(null);
          } catch (parseError) {
            console.error('Error parsing comment data:', parseError);
            setError('Error processing comment data');
            setComments([]);
          } finally {
            setIsLoading(false);
          }
        },
        (err) => {
          console.error('Error fetching comments:', err);
          if (err.code === 'permission-denied') {
            setError('You do not have permission to view comments. Please check your account type.');
          } else {
            setError(`Failed to load comments: ${err.message}`);
          }
          setComments([]);
          setIsLoading(false);
        }
      );
      
      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up comments listener:', error);
      setError('Failed to initialize comments');
      setIsLoading(false);
      return () => {};
    }
  }, [user]);

  const addComment = async (
    commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Comment> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User must be logged in to add comments');
      }
      
      // Create a new comment document
      const now = Timestamp.now();
      const commentRef = await addDoc(collection(db, 'comments'), {
        ...commentData,
        createdAt: now,
        updatedAt: now,
      });
      
      // Return the new comment data
      const newComment: Comment = {
        ...commentData,
        id: commentRef.id,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };

      return newComment;
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError('Failed to add comment');
      throw new Error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  const updateComment = async (
    id: string,
    content: string,
    rating?: number
  ): Promise<Comment> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User must be logged in to update comments');
      }
      
      // Get the existing comment
      const existingComment = comments.find(c => c.id === id);
      if (!existingComment) {
        throw new Error('Comment not found');
      }
      
      // Check if the user owns the comment
      if (existingComment.userId !== user.id) {
        throw new Error('You can only edit your own comments');
      }
      
      // Update fields
      const updates: any = {
        content,
        updatedAt: serverTimestamp(),
      };
      
      if (rating !== undefined) {
        updates.rating = rating;
      }
      
      // Update the comment in Firestore
      const commentRef = doc(db, 'comments', id);
      await updateDoc(commentRef, updates);
      
      // Return the updated comment
      const updatedComment: Comment = {
        ...existingComment,
        content,
        rating: rating !== undefined ? rating : existingComment.rating,
        updatedAt: new Date(),
      };

      return updatedComment;
    } catch (err) {
      console.error('Failed to update comment:', err);
      setError('Failed to update comment');
      throw new Error('Failed to update comment');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComment = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User must be logged in to delete comments');
      }
      
      // Get the existing comment
      const existingComment = comments.find(c => c.id === id);
      if (!existingComment) {
        throw new Error('Comment not found');
      }
      
      // Check if the user owns the comment
      if (existingComment.userId !== user.id) {
        throw new Error('You can only delete your own comments');
      }
      
      // Delete the comment from Firestore
      await deleteDoc(doc(db, 'comments', id));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError('Failed to delete comment');
      throw new Error('Failed to delete comment');
    } finally {
      setIsLoading(false);
    }
  };

  const getCommentsByProperty = (propertyId: string): Comment[] => {
    return comments.filter(comment => comment.propertyId === propertyId);
  };

  const getCommentsByUser = (userId: string): Comment[] => {
    return comments.filter(comment => comment.userId === userId);
  };

  const value = {
    comments,
    isLoading,
    error,
    addComment,
    updateComment,
    deleteComment,
    getCommentsByProperty,
    getCommentsByUser,
  };

  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
};

export const useComment = () => {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error('useComment must be used within a CommentProvider');
  }
  return context;
}; 