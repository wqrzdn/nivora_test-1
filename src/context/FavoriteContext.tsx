import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  Timestamp,
  addDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: Date;
}

interface FavoriteContextType {
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;
  addFavorite: (propertyId: string) => Promise<Favorite>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (propertyId: string) => boolean;
  getFavoritesByUser: (userId: string) => Favorite[];
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Subscribe to user's favorites from Firestore
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null); // Reset error state on new fetch
    
    let unsubscribe = () => {};
    
    try {
      // Query favorites for the current user
      // Using a more permissive query to avoid permission issues
      let favoritesQuery;
      
      try {
        favoritesQuery = query(
          collection(db, 'favorites'),
          where('userId', '==', user.id)
        );
        
        console.log(`Fetching favorites for user: ${user.id}, userType: ${user.userType}`);
      } catch (queryError) {
        console.error('Error creating favorites query:', queryError);
        setError('Failed to create query for favorites');
        setIsLoading(false);
        return () => {};
      }
      
      // Real-time listener for favorites
      unsubscribe = onSnapshot(
        favoritesQuery,
        (snapshot) => {
          try {
            const favoriteData: Favorite[] = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                userId: data.userId,
                propertyId: data.propertyId,
                createdAt: data.createdAt.toDate(),
              };
            });
            
            console.log(`Successfully fetched ${favoriteData.length} favorites`);
            setFavorites(favoriteData);
            setIsLoading(false);
          } catch (parseError) {
            console.error('Error parsing favorites data:', parseError);
            setError('Failed to process favorites data');
            setIsLoading(false);
          }
        },
        (err) => {
          console.error('Error fetching favorites:', err);
          // Check if this is a permission error
          if (err.code === 'permission-denied') {
            console.log('Permission denied error when fetching favorites. Check Firestore rules.');
            setError('You do not have permission to access favorites');
          } else {
            setError('Failed to load favorites');
          }
          setFavorites([]); // Reset favorites on error
          setIsLoading(false);
        }
      );

    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorites');
      setIsLoading(false);
    }

    // Cleanup function
    return () => unsubscribe();
  }, [user]);

  const addFavorite = async (propertyId: string): Promise<Favorite> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User must be logged in to add favorites');
      }
      
      // Check if property is already favorited
      const existing = favorites.find(f => f.propertyId === propertyId);
      if (existing) {
        return existing;
      }
      
      // Create a new favorite document
      const now = Timestamp.now();
      const favoriteRef = await addDoc(collection(db, 'favorites'), {
        userId: user.id,
        propertyId,
        createdAt: now,
      });
      
      // Return the new favorite data
      const newFavorite: Favorite = {
        id: favoriteRef.id,
        userId: user.id,
        propertyId,
        createdAt: now.toDate(),
      };

      return newFavorite;
    } catch (err) {
      console.error('Failed to add favorite:', err);
      setError('Failed to add favorite');
      throw new Error('Failed to add favorite');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User must be logged in to remove favorites');
      }
      
      // Delete the favorite from Firestore
      await deleteDoc(doc(db, 'favorites', id));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      setError('Failed to remove favorite');
      throw new Error('Failed to remove favorite');
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorite = (propertyId: string): boolean => {
    return favorites.some(favorite => favorite.propertyId === propertyId);
  };

  const getFavoritesByUser = (userId: string): Favorite[] => {
    return favorites.filter(favorite => favorite.userId === userId);
  };

  const value = {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavoritesByUser,
  };

  return <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>;
};

export const useFavorite = () => {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorite must be used within a FavoriteProvider');
  }
  return context;
}; 