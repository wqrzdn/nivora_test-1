import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  updateEmail,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Define User Type
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'owner' | 'tenant' | 'service-provider';
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  serviceCategory?: string; // For service providers
  serviceAreas?: string[]; // For service providers
}

interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  password?: string;
  serviceCategory?: string;
  serviceAreas?: string[];
}

// Define Context Type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<FirebaseUser>;
  loginWithGoogle: () => Promise<FirebaseUser>;
  register: (userData: any) => Promise<FirebaseUser>;
  logout: () => void;
  updateUserProfile: (data: ProfileUpdateData) => Promise<void>;
  isAuthenticated: boolean;
  authInitialized: boolean;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Check if user is already logged in on mount and listen for auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? `User: ${firebaseUser.uid}` : 'No user');
      setIsLoading(true);
      
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<User, 'id'>;
            setUser({
              id: firebaseUser.uid,
              ...userData
            });
            console.log('User data loaded from Firestore');
          } else {
            console.log('User exists in Auth but not in Firestore');
            // Instead of logging out, create a basic user document
            // This helps with Google Sign-In where the user might exist in Auth but not in Firestore
            const names = firebaseUser.displayName?.split(' ') || ['', ''];
            const userData = {
              firstName: names[0] || '',
              lastName: names.slice(1).join(' ') || '',
              email: firebaseUser.email || '',
              userType: 'tenant' as const, // Default user type
              createdAt: new Date(),
              updatedAt: new Date(),
              avatarUrl: firebaseUser.photoURL || '',
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
            setUser({
              id: firebaseUser.uid,
              ...userData
            });
            console.log('Created new user document in Firestore');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
      setAuthInitialized(true);
    });
    
    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting to sign in with email and password');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('Sign in successful:', firebaseUser.uid);
      
      // User data will be set by the onAuthStateChanged listener
      return firebaseUser;
    } catch (error: any) {
      console.error('Login error:', error);
      // Provide more specific error messages based on Firebase error codes
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password');
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid credentials. Please check your email and password.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed login attempts. Please try again later.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled. Please contact support.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email format.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: any) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting to create user with email and password');
      console.log('Registration data:', JSON.stringify(userData, null, 2));
      
      // Validate password length to avoid common Firebase auth errors
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Create user with email and password
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(
          auth, 
          userData.email.trim(), // Trim to remove any accidental whitespace
          userData.password
        );
      } catch (authError: any) {
        console.error('Firebase Auth Error:', authError);
        // Handle specific auth errors
        if (authError.code === 'auth/email-already-in-use') {
          throw new Error('Email is already in use. Please use a different email or try logging in.');
        } else if (authError.code === 'auth/weak-password') {
          throw new Error('Password must be at least 6 characters long');
        } else if (authError.code === 'auth/invalid-email') {
          throw new Error('Invalid email address format');
        } else if (authError.code === 'auth/invalid-credential') {
          throw new Error('Invalid credentials. Please try again with a different email or password.');
        } else if (authError.code === 'auth/network-request-failed') {
          throw new Error('Network error. Please check your internet connection.');
        } else {
          throw new Error(authError.message || 'Registration failed. Please try again.');
        }
      }
      
      if (!userCredential || !userCredential.user) {
        throw new Error('Failed to create user account. Please try again.');
      }
      
      const firebaseUser = userCredential.user;
      console.log('User created successfully:', firebaseUser.uid);
      
      // Update profile display name
      try {
        await updateProfile(firebaseUser, {
          displayName: `${userData.firstName} ${userData.lastName}`
        });
        console.log('Profile display name updated successfully');
      } catch (profileError) {
        console.error('Error updating profile display name:', profileError);
        // Continue despite profile update error
      }
      
      // Store additional user data in Firestore
      try {
        const userDataToStore: any = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          userType: userData.userType || 'tenant', // Ensure a default userType
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Add service provider specific fields if applicable
        if (userData.userType === 'service-provider') {
          userDataToStore.serviceCategory = userData.serviceCategory || '';
          userDataToStore.serviceAreas = userData.serviceAreas || [];
        }
        
        // Important: Create a complete user object for state management
        const completeUserData: User = {
          id: firebaseUser.uid,
          ...userDataToStore
        };
        
        // Write user data to Firestore
        await setDoc(doc(db, 'users', firebaseUser.uid), userDataToStore);
        console.log('User data stored in Firestore successfully');
        
        // CRITICAL: Manually set the user state to ensure immediate login
        // This bypasses waiting for the onAuthStateChanged listener
        setUser(completeUserData);
        setIsLoading(false);
        setAuthInitialized(true);
        
        console.log('User state set manually after registration:', completeUserData);
      } catch (firestoreError) {
        console.error('Error storing user data in Firestore:', firestoreError);
        
        // Even if Firestore storage fails, we should still set the user state
        // with basic information from Firebase Auth to ensure login works
        const basicUserData: User = {
          id: firebaseUser.uid,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          userType: userData.userType || 'tenant',
        };
        
        setUser(basicUserData);
        console.log('Set basic user data after Firestore error');
      }
      
      return firebaseUser;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error; // Re-throw the error with our custom message from above
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (data: ProfileUpdateData) => {
    setIsLoading(true);
    
    try {
      if (!user || !auth.currentUser) {
        throw new Error('User must be logged in to update profile');
      }
      
      const updates: any = {};
      const authUpdates: Promise<any>[] = [];
      
      // Update data in Firestore
      if (data.firstName) updates.firstName = data.firstName;
      if (data.lastName) updates.lastName = data.lastName;
      if (data.phone) updates.phone = data.phone;
      if (data.avatarUrl) updates.avatarUrl = data.avatarUrl;
      if (data.bio) updates.bio = data.bio;
      
      // Update email in both Auth and Firestore if provided
      if (data.email && data.email !== user.email) {
        authUpdates.push(updateEmail(auth.currentUser, data.email));
        updates.email = data.email;
      }
      
      // Update password if provided
      if (data.password) {
        authUpdates.push(updatePassword(auth.currentUser, data.password));
      }
      
      // Update display name in Firebase Auth if name changed
      if (data.firstName || data.lastName) {
        const newFirstName = data.firstName || user.firstName;
        const newLastName = data.lastName || user.lastName;
        authUpdates.push(updateProfile(auth.currentUser, {
          displayName: `${newFirstName} ${newLastName}`
        }));
      }
      
      // Update avatar in Firebase Auth if provided
      if (data.avatarUrl) {
        authUpdates.push(updateProfile(auth.currentUser, {
          photoURL: data.avatarUrl
        }));
      }
      
      // Apply Firestore updates if there are any
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'users', user.id), {
          ...updates,
          updatedAt: new Date()
        });
      }
      
      // Apply Firebase Auth updates if there are any
      if (authUpdates.length > 0) {
        await Promise.all(authUpdates);
      }
      
      // Update the local user state
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          ...updates
        };
      });
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      // User state will be cleared by the onAuthStateChanged listener
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Google Sign-In function
  const loginWithGoogle = async () => {
    setIsLoading(true);
    
    try {
      console.log('Attempting to sign in with Google');
      const provider = new GoogleAuthProvider();
      
      // Don't request additional scopes - these can cause permission issues
      // provider.addScope('profile');
      // provider.addScope('email');
      
      // Set custom parameters for better UX
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);
      console.log('Google sign in successful:', user.uid);
      
      // Check if this is a new user (first time sign-in)
      if (additionalInfo?.isNewUser) {
        console.log('New user from Google sign-in');
        // Create a new user document in Firestore
        const names = user.displayName?.split(' ') || ['', ''];
        const firstName = names[0] || '';
        const lastName = names.slice(1).join(' ') || '';
        
        // Create user data object
        const userData = {
          firstName,
          lastName,
          email: user.email || '',
          userType: 'tenant' as const, // Default user type for Google sign-in
          createdAt: new Date(),
          updatedAt: new Date(),
          avatarUrl: user.photoURL || '',
        };
        
        try {
          // Save to Firestore
          await setDoc(doc(db, 'users', user.uid), userData);
          console.log('Created new user document in Firestore');
        } catch (firestoreError) {
          console.error('Error creating user document:', firestoreError);
          // Continue with auth - we'll try to create the document again on next login
        }
      } else {
        console.log('Existing user from Google sign-in');
        // Existing user - verify they have a document in Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists()) {
            console.log('User exists in Auth but not in Firestore, creating document');
            // User exists in Firebase Auth but not in Firestore
            // Create a basic user document
            const names = user.displayName?.split(' ') || ['', ''];
            await setDoc(doc(db, 'users', user.uid), {
              firstName: names[0] || '',
              lastName: names.slice(1).join(' ') || '',
              email: user.email || '',
              userType: 'tenant' as const,
              createdAt: new Date(),
              updatedAt: new Date(),
              avatarUrl: user.photoURL || '',
            });
          }
        } catch (firestoreError) {
          console.error('Error checking/creating user document:', firestoreError);
          // Continue with auth - we'll try to create the document again on next login
        }
      }
      
      return user;
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error(error.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUserProfile,
    isAuthenticated: !!user,
    authInitialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 