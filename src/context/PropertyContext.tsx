import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, orderBy, onSnapshot, getDoc,
  serverTimestamp, Timestamp
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

// Define Property Type
export interface Property {
  id: string;
  ownerId: string;
  title: string;
  type: 'house' | 'apartment' | 'commercial';
  address: string;
  city: string;
  state: string;
  pincode: string;
  rent: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  furnishing: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  isPetFriendly: boolean;
  area: number; // in sq. ft.
  description: string;
  amenities: string[];
  images: string[];
  status: 'available' | 'rented' | 'pending';
  genderPreference: 'male' | 'female' | 'any';
  accommodationType: 'family' | 'bachelor' | 'pg' | 'any';
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Define Context Type
interface PropertyContextType {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Property>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<Property>;
  deleteProperty: (id: string) => Promise<void>;
  getPropertyById: (id: string) => Promise<Property | undefined>;
  getPropertiesByOwner: (ownerId: string) => Property[];
}

// Create Context
const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

// Provider Component
export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Subscribe to properties from Firestore
  useEffect(() => {
    if (!user) {
      setProperties([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null); // Reset error state
    
    try {
      console.log('Fetching properties for user type:', user.userType);
      
      // Create a query for all properties, ordered by creation date
      const propertiesQuery = query(
        collection(db, 'properties'),
        orderBy('createdAt', 'desc')
      );

      // Real-time listener for properties
      const unsubscribe = onSnapshot(
        propertiesQuery,
        (snapshot) => {
          try {
            console.log(`Received ${snapshot.docs.length} properties from Firestore`);
            const propertyData: Property[] = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ownerId: data.ownerId,
                title: data.title,
                type: data.type,
                address: data.address,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                rent: data.rent,
                deposit: data.deposit,
                bedrooms: data.bedrooms,
                bathrooms: data.bathrooms,
                furnishing: data.furnishing,
                isPetFriendly: data.isPetFriendly,
                area: data.area,
                description: data.description,
                amenities: data.amenities,
                images: data.images,
                status: data.status,
                genderPreference: data.genderPreference || 'any',
                accommodationType: data.accommodationType || 'any',
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
              };
            });
            
            setProperties(propertyData);
            setError(null);
          } catch (parseError) {
            console.error('Error parsing property data:', parseError);
            setError('Error processing property data');
            setProperties([]);
          } finally {
            setIsLoading(false);
          }
        },
        (err) => {
          console.error('Error fetching properties:', err);
          if (err.code === 'permission-denied') {
            setError('You do not have permission to view properties. Please check your account type.');
          } else {
            setError(`Failed to load properties: ${err.message}`);
          }
          setProperties([]);
          setIsLoading(false);
        }
      );
      
      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up properties listener:', error);
      setError('Failed to initialize properties');
      setIsLoading(false);
      return () => {};
    }
  }, [user]);

  // Add a new property
  const addProperty = async (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> => {
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error('User must be logged in to add properties');
      }
      
      // Create a new property document
      const now = Timestamp.now();
      const propertyRef = await addDoc(collection(db, 'properties'), {
        ...property,
        createdAt: now,
        updatedAt: now,
      });
      
      // Get the new property with the generated ID
      const propertyDoc = await getDoc(propertyRef);
      if (!propertyDoc.exists()) {
        throw new Error('Failed to retrieve new property');
      }
      
      const data = propertyDoc.data();
      const newProperty: Property = {
        id: propertyRef.id,
        ownerId: data.ownerId,
        title: data.title,
        type: data.type,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        rent: data.rent,
        deposit: data.deposit,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        furnishing: data.furnishing,
        isPetFriendly: data.isPetFriendly,
        area: data.area,
        description: data.description,
        amenities: data.amenities,
        images: data.images,
        status: data.status,
        genderPreference: data.genderPreference || 'any',
        accommodationType: data.accommodationType || 'any',
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
      
      return newProperty;
    } catch (err) {
      console.error('Failed to add property:', err);
      setError('Failed to add property');
      throw new Error('Failed to add property');
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing property
  const updateProperty = async (id: string, propertyUpdates: Partial<Property>): Promise<Property> => {
    setIsLoading(true);
    
    try {
      // Remove id, createdAt from updates if they exist
      const { id: _, createdAt: __, ...updates } = propertyUpdates as any;
      
      // Update the property in Firestore
      const propertyRef = doc(db, 'properties', id);
      await updateDoc(propertyRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      // Get the updated property
      const updatedDoc = await getDoc(propertyRef);
      if (!updatedDoc.exists()) {
        throw new Error('Property not found');
      }
      
      const data = updatedDoc.data();
      const updatedProperty: Property = {
        id: updatedDoc.id,
        ownerId: data.ownerId,
        title: data.title,
        type: data.type,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        rent: data.rent,
        deposit: data.deposit,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        furnishing: data.furnishing,
        isPetFriendly: data.isPetFriendly,
        area: data.area,
        description: data.description,
        amenities: data.amenities,
        images: data.images,
        status: data.status,
        genderPreference: data.genderPreference || 'any',
        accommodationType: data.accommodationType || 'any',
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
      
      return updatedProperty;
    } catch (err) {
      console.error('Failed to update property:', err);
      setError('Failed to update property');
      throw new Error('Failed to update property');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a property
  const deleteProperty = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Delete the property document from Firestore
      await deleteDoc(doc(db, 'properties', id));
    } catch (err) {
      console.error('Failed to delete property:', err);
      setError('Failed to delete property');
      throw new Error('Failed to delete property');
    } finally {
      setIsLoading(false);
    }
  };

  // Get a property by ID
  const getPropertyById = async (id: string): Promise<Property | undefined> => {
    try {
      console.log('Fetching property document with ID:', id);
      const propertyDoc = await getDoc(doc(db, 'properties', id));
      
      if (!propertyDoc.exists()) {
        console.log('Property document does not exist');
        return undefined;
      }
      
      const data = propertyDoc.data();
      console.log('Raw property data:', data);
      
      // Enhanced error logging for debugging
      if (!data) {
        console.error('Property data is null or undefined');
        return undefined;
      }
      
      // Check if required fields exist
      if (!data.title) {
        console.error('Property data is missing title:', data);
        return undefined;
      }
      
      if (!data.ownerId) {
        console.error('Property data is missing ownerId:', data);
        return undefined;
      }
      
      // Handle dates that might be Firestore Timestamps or already converted to Date objects
      const createdAt = data.createdAt && typeof data.createdAt.toDate === 'function' 
        ? data.createdAt.toDate() 
        : data.createdAt || new Date();
        
      const updatedAt = data.updatedAt && typeof data.updatedAt.toDate === 'function' 
        ? data.updatedAt.toDate() 
        : data.updatedAt || new Date();
      
      // Construct and return the property object with default values for missing fields
      return {
        id: propertyDoc.id,
        ownerId: data.ownerId,
        title: data.title,
        type: data.type || 'apartment',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        rent: data.rent || 0,
        deposit: data.deposit || 0,
        bedrooms: data.bedrooms || 1,
        bathrooms: data.bathrooms || 1,
        furnishing: data.furnishing || 'unfurnished',
        isPetFriendly: data.isPetFriendly || false,
        area: data.area || 0,
        description: data.description || '',
        amenities: data.amenities || [],
        images: data.images || [],
        status: data.status || 'available',
        genderPreference: data.genderPreference || 'any',
        accommodationType: data.accommodationType || 'any',
        createdAt,
        updatedAt,
      };
    } catch (err) {
      console.error('Failed to get property:', err);
      setError('Failed to get property');
      return undefined;
    }
  };

  // Get properties by owner ID
  const getPropertiesByOwner = (ownerId: string): Property[] => {
    return properties.filter(property => property.ownerId === ownerId);
  };

  const value = {
    properties,
    isLoading,
    error,
    addProperty,
    updateProperty,
    deleteProperty,
    getPropertyById,
    getPropertiesByOwner,
  };

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
};

// Custom hook for using the property context
export const useProperty = () => {
  const context = useContext(PropertyContext);
  
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  
  return context;
}; 