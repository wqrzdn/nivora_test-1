import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  Timestamp,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

// Define ServiceBooking Type
export interface ServiceBooking {
  id: string;
  serviceId: string;
  providerId: string;
  userId: string; // tenant or owner
  propertyId?: string; // optional reference to property
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: Date;
  timeSlot: string;
  description: string;
  price: number;
  ownerId?: string; // If booked by tenant, store owner ID for notification
  createdAt: Date;
  updatedAt: Date;
}

// Define Context Type
interface ServiceBookingContextType {
  bookings: ServiceBooking[];
  isLoading: boolean;
  error: string | null;
  createBooking: (booking: Omit<ServiceBooking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ServiceBooking>;
  updateBookingStatus: (id: string, status: ServiceBooking['status']) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  getUserBookings: (userId: string) => ServiceBooking[];
  getProviderBookings: (providerId: string) => ServiceBooking[];
  getPropertyBookings: (propertyId: string) => ServiceBooking[];
}

// Create Context
const ServiceBookingContext = createContext<ServiceBookingContextType | undefined>(undefined);

// Provider Component
export const ServiceBookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Subscribe to bookings from Firestore
  useEffect(() => {
    if (!user) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Create a query for bookings relevant to the current user
    let bookingsQuery;
    
    try {
      if (user.userType === 'service-provider') {
        // Service providers see bookings where they are the provider
        // Using only the where clause without orderBy to avoid requiring a composite index
        bookingsQuery = query(
          collection(db, 'serviceBookings'),
          where('providerId', '==', user.id)
          // Removed orderBy to avoid composite index requirement
        );
      } else {
        // Owners and tenants see bookings they created
        // Using only the where clause without orderBy to avoid requiring a composite index
        bookingsQuery = query(
          collection(db, 'serviceBookings'),
          where('userId', '==', user.id)
          // Removed orderBy to avoid composite index requirement
        );
      }
      
      console.log(`Created query for user type: ${user.userType}, user ID: ${user.id}`);
    } catch (queryError) {
      console.error('Error creating query:', queryError);
      setError('Failed to create query for service bookings');
      setIsLoading(false);
      return () => {};
    }

    // Real-time listener for bookings
    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const bookingData: ServiceBooking[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            serviceId: data.serviceId,
            providerId: data.providerId,
            userId: data.userId,
            propertyId: data.propertyId,
            status: data.status,
            date: data.date.toDate(),
            timeSlot: data.timeSlot,
            description: data.description,
            price: data.price,
            ownerId: data.ownerId,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
          };
        });
        
        setBookings(bookingData);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
        setIsLoading(false);
      }
    );

    // Cleanup function
    return () => unsubscribe();
  }, [user]);

  // Create a new booking
  const createBooking = async (booking: Omit<ServiceBooking, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceBooking> => {
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error('User must be logged in to create bookings');
      }
      
      // Create a new booking document
      const now = Timestamp.now();
      const bookingRef = await addDoc(collection(db, 'serviceBookings'), {
        ...booking,
        status: 'pending', // Always start as pending
        createdAt: now,
        updatedAt: now,
      });
      
      // Get the new booking with the generated ID
      const bookingDoc = await getDoc(bookingRef);
      if (!bookingDoc.exists()) {
        throw new Error('Failed to retrieve new booking');
      }
      
      const data = bookingDoc.data();
      const newBooking: ServiceBooking = {
        id: bookingRef.id,
        serviceId: data.serviceId,
        providerId: data.providerId,
        userId: data.userId,
        propertyId: data.propertyId,
        status: data.status,
        date: data.date.toDate(),
        timeSlot: data.timeSlot,
        description: data.description,
        price: data.price,
        ownerId: data.ownerId,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
      
      return newBooking;
    } catch (err) {
      console.error('Failed to create booking:', err);
      setError('Failed to create booking');
      throw new Error('Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  // Update booking status
  const updateBookingStatus = async (id: string, status: ServiceBooking['status']): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Update the booking status in Firestore
      const bookingRef = doc(db, 'serviceBookings', id);
      await updateDoc(bookingRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to update booking status:', err);
      setError('Failed to update booking status');
      throw new Error('Failed to update booking status');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel a booking
  const cancelBooking = async (id: string): Promise<void> => {
    await updateBookingStatus(id, 'cancelled');
  };

  // Get bookings by user ID
  const getUserBookings = (userId: string): ServiceBooking[] => {
    return bookings.filter(booking => booking.userId === userId);
  };

  // Get bookings by provider ID
  const getProviderBookings = (providerId: string): ServiceBooking[] => {
    return bookings.filter(booking => booking.providerId === providerId);
  };

  // Get bookings by property ID
  const getPropertyBookings = (propertyId: string): ServiceBooking[] => {
    return bookings.filter(booking => booking.propertyId === propertyId);
  };

  const value = {
    bookings,
    isLoading,
    error,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    getUserBookings,
    getProviderBookings,
    getPropertyBookings,
  };

  return <ServiceBookingContext.Provider value={value}>{children}</ServiceBookingContext.Provider>;
};

export const useServiceBooking = () => {
  const context = useContext(ServiceBookingContext);
  if (context === undefined) {
    throw new Error('useServiceBooking must be used within a ServiceBookingProvider');
  }
  return context;
};
