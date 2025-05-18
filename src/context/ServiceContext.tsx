import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  Timestamp,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { uploadFile } from '../utils/fileUpload';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

// Define Service Type
export interface Service {
  id: string;
  providerId: string;
  category: string; // electrician, plumber, painter, etc.
  title: string;
  description: string;
  price: number;
  priceType: 'hourly' | 'fixed';
  availability: {
    days: string[]; // Mon, Tue, etc.
    startTime: string;
    endTime: string;
  };
  location: {
    city: string;
    areas: string[]; // Areas served
  };
  rating?: number;
  reviewCount?: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define Context Type
interface ServiceContextType {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  addService: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Service>;
  updateService: (id: string, service: Partial<Service>) => Promise<Service>;
  deleteService: (id: string) => Promise<void>;
  getServiceById: (id: string) => Promise<Service | undefined>;
  getServicesByProvider: (providerId: string) => Service[];
  getServicesByCategory: (category: string) => Service[];
  uploadServiceImage: (file: File) => Promise<string>;
}

// Create Context
const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

// Provider Component
export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Subscribe to services from Firestore
  useEffect(() => {
    if (!user) {
      setServices([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching services for user type:', user.userType);
      
      // Create a query for all services, ordered by creation date
      // All user types (owner, tenant, service-provider) should be able to view services
      const servicesQuery = query(
        collection(db, 'services'),
        orderBy('createdAt', 'desc')
      );

      console.log(`User ID: ${user.id}, User Type: ${user.userType} - Attempting to fetch services`);

      // Real-time listener for services
      const unsubscribe = onSnapshot(
        servicesQuery,
        (snapshot) => {
          try {
            console.log(`Received ${snapshot.docs.length} services from Firestore`);
            const serviceData: Service[] = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                providerId: data.providerId,
                category: data.category,
                title: data.title,
                description: data.description,
                price: data.price,
                priceType: data.priceType,
                availability: data.availability,
                location: data.location,
                rating: data.rating,
                reviewCount: data.reviewCount,
                images: data.images || [], // Ensure images is always an array
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
              };
            });
            
            console.log(`Successfully processed ${serviceData.length} services for user type: ${user.userType}`);
            setServices(serviceData);
            setError(null);
          } catch (parseError) {
            console.error('Error parsing service data:', parseError);
            setError('Error processing service data');
            setServices([]);
          } finally {
            setIsLoading(false);
          }
        },
        (err) => {
          console.error('Error fetching services:', err);
          if (err.code === 'permission-denied') {
            console.error(`Permission denied for user type: ${user.userType}, user ID: ${user.id}`);
            setError('You do not have permission to view services. Please check your account type and Firestore rules.');
          } else {
            setError(`Failed to load services: ${err.message}`);
          }
          setServices([]);
          setIsLoading(false);
        }
      );
      
      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up services listener:', error);
      setError('Failed to initialize services');
      setIsLoading(false);
      return () => {};
    }
  }, [user]);

  // Add a new service
  const addService = async (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> => {
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error('User must be logged in to add services');
      }
      
      // Create a new service document
      const now = Timestamp.now();
      const serviceRef = await addDoc(collection(db, 'services'), {
        ...service,
        createdAt: now,
        updatedAt: now,
      });
      
      // Get the new service with the generated ID
      const serviceDoc = await getDoc(serviceRef);
      if (!serviceDoc.exists()) {
        throw new Error('Failed to retrieve new service');
      }
      
      const data = serviceDoc.data();
      const newService: Service = {
        id: serviceRef.id,
        providerId: data.providerId,
        category: data.category,
        title: data.title,
        description: data.description,
        price: data.price,
        priceType: data.priceType,
        availability: data.availability,
        location: data.location,
        rating: data.rating,
        reviewCount: data.reviewCount,
        images: data.images,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
      
      return newService;
    } catch (err) {
      console.error('Failed to add service:', err);
      setError('Failed to add service');
      throw new Error('Failed to add service');
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing service
  const updateService = async (id: string, serviceUpdates: Partial<Service>): Promise<Service> => {
    setIsLoading(true);
    
    try {
      // Remove id, createdAt from updates if they exist
      const { id: _, createdAt: __, ...updates } = serviceUpdates as any;
      
      // Update the service in Firestore
      const serviceRef = doc(db, 'services', id);
      await updateDoc(serviceRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      // Get the updated service
      const updatedDoc = await getDoc(serviceRef);
      if (!updatedDoc.exists()) {
        throw new Error('Service not found');
      }
      
      const data = updatedDoc.data();
      const updatedService: Service = {
        id: updatedDoc.id,
        providerId: data.providerId,
        category: data.category,
        title: data.title,
        description: data.description,
        price: data.price,
        priceType: data.priceType,
        availability: data.availability,
        location: data.location,
        rating: data.rating,
        reviewCount: data.reviewCount,
        images: data.images,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
      
      return updatedService;
    } catch (err) {
      console.error('Failed to update service:', err);
      setError('Failed to update service');
      throw new Error('Failed to update service');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a service
  const deleteService = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Delete the service from Firestore
      await deleteDoc(doc(db, 'services', id));
    } catch (err) {
      console.error('Failed to delete service:', err);
      setError('Failed to delete service');
      throw new Error('Failed to delete service');
    } finally {
      setIsLoading(false);
    }
  };

  // Get a service by ID
  const getServiceById = async (id: string): Promise<Service | undefined> => {
    try {
      const serviceDoc = await getDoc(doc(db, 'services', id));
      
      if (!serviceDoc.exists()) {
        return undefined;
      }
      
      const data = serviceDoc.data();
      return {
        id: serviceDoc.id,
        providerId: data.providerId,
        category: data.category,
        title: data.title,
        description: data.description,
        price: data.price,
        priceType: data.priceType,
        availability: data.availability,
        location: data.location,
        rating: data.rating,
        reviewCount: data.reviewCount,
        images: data.images,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    } catch (err) {
      console.error('Failed to get service:', err);
      setError('Failed to get service');
      return undefined;
    }
  };

  // Get services by provider ID
  const getServicesByProvider = (providerId: string): Service[] => {
    return services.filter(service => service.providerId === providerId);
  };

  // Get services by category
  const getServicesByCategory = (category: string): Service[] => {
    return services.filter(service => service.category === category);
  };

  // Upload service image
  const uploadServiceImage = async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('User must be logged in to upload images');
    }
    
    try {
      // Use the fileUpload utility to upload the image
      const downloadURL = await uploadFile(file, `services/${user.id}`);
      return downloadURL;
    } catch (err) {
      console.error('Failed to upload image:', err);
      throw new Error('Failed to upload image');
    }
  };

  const value = {
    services,
    isLoading,
    error,
    addService,
    updateService,
    deleteService,
    getServiceById,
    getServicesByProvider,
    getServicesByCategory,
    uploadServiceImage,
  };

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>;
};

export const useService = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};
