import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

// Define Roommate Profile Type
export interface RoommateProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  budget: {
    min: number;
    max: number;
  };
  preferredLocations: string[];
  lifestyle: {
    smoking: boolean;
    pets: boolean;
    drinking: boolean;
    foodPreference?: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'no-preference';
    workSchedule?: 'day' | 'night' | 'flexible';
    cleanliness?: 'very-clean' | 'clean' | 'moderate' | 'relaxed';
  };
  bio: string;
  lookingFor: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Context Type
interface RoommateContextType {
  userProfile: RoommateProfile | null;
  isLoading: boolean;
  createProfile: (profileData: Partial<RoommateProfile>) => Promise<void>;
  updateProfile: (profileData: Partial<RoommateProfile>) => Promise<void>;
  deleteProfile: () => Promise<void>;
  searchProfiles: (filters: any) => Promise<RoommateProfile[]>;
  getProfileById: (profileId: string) => Promise<RoommateProfile | null>;
  recommendedMatches: RoommateProfile[];
}

// Create Context
const RoommateContext = createContext<RoommateContextType | undefined>(undefined);

// Provider Component
export const RoommateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<RoommateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedMatches, setRecommendedMatches] = useState<RoommateProfile[]>([]);

  // Load user's roommate profile if exists
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    const profileRef = doc(db, 'roommateProfiles', user.id);
    
    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as RoommateProfile);
        
        // If user has a profile, fetch recommended matches
        fetchRecommendedMatches(data as RoommateProfile);
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching roommate profile:", error);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Create a new roommate profile
  const createProfile = async (profileData: Partial<RoommateProfile>) => {
    if (!user) throw new Error('User must be logged in to create a profile');
    
    setIsLoading(true);
    
    try {
      const profileRef = doc(db, 'roommateProfiles', user.id);
      
      const newProfile = {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(profileRef, newProfile);
      
      // Profile will be updated by the onSnapshot listener
    } catch (error) {
      console.error('Error creating roommate profile:', error);
      throw new Error('Failed to create roommate profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing roommate profile
  const updateProfile = async (profileData: Partial<RoommateProfile>) => {
    if (!user || !userProfile) throw new Error('User must have a profile to update');
    
    setIsLoading(true);
    
    try {
      const profileRef = doc(db, 'roommateProfiles', user.id);
      
      await updateDoc(profileRef, {
        ...profileData,
        updatedAt: new Date(),
      });
      
      // Profile will be updated by the onSnapshot listener
    } catch (error) {
      console.error('Error updating roommate profile:', error);
      throw new Error('Failed to update roommate profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a roommate profile
  const deleteProfile = async () => {
    if (!user) throw new Error('User must be logged in to delete a profile');
    
    setIsLoading(true);
    
    try {
      await deleteDoc(doc(db, 'roommateProfiles', user.id));
      setUserProfile(null);
    } catch (error) {
      console.error('Error deleting roommate profile:', error);
      throw new Error('Failed to delete roommate profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Search for roommate profiles with filters
  const searchProfiles = async (filters: any) => {
    if (!user) throw new Error('User must be logged in to search profiles');
    
    setIsLoading(true);
    
    try {
      let q = query(collection(db, 'roommateProfiles'));
      
      // Add filters
      if (filters.budget?.min) {
        q = query(q, where('budget.min', '>=', filters.budget.min));
      }
      
      if (filters.budget?.max) {
        q = query(q, where('budget.max', '<=', filters.budget.max));
      }
      
      if (filters.locations && filters.locations.length > 0) {
        q = query(q, where('preferredLocations', 'array-contains-any', filters.locations));
      }
      
      // Execute query
      const querySnapshot = await getDocs(q);
      
      // Filter out current user's profile
      const profiles: RoommateProfile[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== user.id) {
          const data = doc.data();
          profiles.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as RoommateProfile);
        }
      });
      
      return profiles;
    } catch (error) {
      console.error('Error searching roommate profiles:', error);
      throw new Error('Failed to search roommate profiles');
    } finally {
      setIsLoading(false);
    }
  };

  // Get a specific profile by ID
  const getProfileById = async (profileId: string) => {
    setIsLoading(true);
    
    try {
      const docRef = doc(db, 'roommateProfiles', profileId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as RoommateProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching roommate profile:', error);
      throw new Error('Failed to fetch roommate profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Algorithm to find recommended matches based on user's profile
  const fetchRecommendedMatches = async (userProfile: RoommateProfile) => {
    if (!user) return;
    
    try {
      // Get all profiles
      const querySnapshot = await getDocs(collection(db, 'roommateProfiles'));
      
      const allProfiles: RoommateProfile[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== user.id) { // Exclude current user
          const data = doc.data();
          allProfiles.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as RoommateProfile);
        }
      });
      
      // Calculate compatibility score for each profile
      const scoredProfiles = allProfiles.map(profile => {
        let score = 0;
        
        // Budget compatibility (30%)
        const budgetOverlap = Math.min(userProfile.budget.max, profile.budget.max) - 
                             Math.max(userProfile.budget.min, profile.budget.min);
        if (budgetOverlap >= 0) {
          score += 30;
        } else {
          // Partial score based on how close the budgets are
          const gap = Math.abs(budgetOverlap);
          const maxGap = Math.max(userProfile.budget.max, profile.budget.max) * 0.5;
          if (gap <= maxGap) {
            score += 30 * (1 - gap / maxGap);
          }
        }
        
        // Location compatibility (30%)
        const commonLocations = userProfile.preferredLocations.filter(loc => 
          profile.preferredLocations.includes(loc)
        );
        if (commonLocations.length > 0) {
          score += 30 * (commonLocations.length / Math.max(userProfile.preferredLocations.length, profile.preferredLocations.length));
        }
        
        // Lifestyle compatibility (40%)
        let lifestyleScore = 0;
        
        // Smoking
        if (userProfile.lifestyle.smoking === profile.lifestyle.smoking) {
          lifestyleScore += 10;
        }
        
        // Pets
        if (userProfile.lifestyle.pets === profile.lifestyle.pets) {
          lifestyleScore += 10;
        }
        
        // Drinking
        if (userProfile.lifestyle.drinking === profile.lifestyle.drinking) {
          lifestyleScore += 10;
        }
        
        // Food preference
        if (userProfile.lifestyle.foodPreference === profile.lifestyle.foodPreference ||
            userProfile.lifestyle.foodPreference === 'no-preference' ||
            profile.lifestyle.foodPreference === 'no-preference') {
          lifestyleScore += 5;
        }
        
        // Cleanliness
        const cleanlinessLevels = ['very-clean', 'clean', 'moderate', 'relaxed'];
        const userCleanIndex = cleanlinessLevels.indexOf(userProfile.lifestyle.cleanliness || 'moderate');
        const profileCleanIndex = cleanlinessLevels.indexOf(profile.lifestyle.cleanliness || 'moderate');
        
        if (Math.abs(userCleanIndex - profileCleanIndex) <= 1) {
          lifestyleScore += 5;
        }
        
        score += lifestyleScore;
        
        return {
          profile,
          score
        };
      });
      
      // Sort by score (descending) and take top 5
      const topMatches = scoredProfiles
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(item => item.profile);
      
      setRecommendedMatches(topMatches);
    } catch (error) {
      console.error('Error fetching recommended matches:', error);
    }
  };

  const contextValue: RoommateContextType = {
    userProfile,
    isLoading,
    createProfile,
    updateProfile,
    deleteProfile,
    searchProfiles,
    getProfileById,
    recommendedMatches
  };

  return (
    <RoommateContext.Provider value={contextValue}>
      {children}
    </RoommateContext.Provider>
  );
};

// Custom hook for using the roommate context
export const useRoommate = () => {
  const context = useContext(RoommateContext);
  if (context === undefined) {
    throw new Error('useRoommate must be used within a RoommateProvider');
  }
  return context;
};
