import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc,
  addDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
  QuerySnapshot,
  DocumentData,
  FirestoreError
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

export interface Booking {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BookingContextType {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  createBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<Booking>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<Booking>;
  updatePaymentStatus: (id: string, paymentStatus: Booking['paymentStatus']) => Promise<Booking>;
  cancelBooking: (id: string) => Promise<Booking>;
  getBookingsByProperty: (propertyId: string) => Booking[];
  getBookingsByTenant: (tenantId: string) => Booking[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
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
    setError(null); // Reset error state on new fetch
    
    let unsubscribe = () => {};
    
    try {
      let bookingsQuery;
      
      try {
        if (user.userType === 'owner') {
          // For owners, fetch bookings related to their properties
          // Removed orderBy to avoid composite index requirement
          bookingsQuery = query(
            collection(db, 'bookings')
            // Using a simpler query to avoid permission issues
          );
          console.log('Using owner query for bookings');
        } else if (user.userType === 'tenant') {
          // For tenants, fetch only their bookings
          // Removed orderBy to avoid composite index requirement
          bookingsQuery = query(
            collection(db, 'bookings'),
            where('tenantId', '==', user.id)
          );
          console.log('Using tenant query for bookings with tenantId:', user.id);
        } else {
          // For other user types, don't fetch bookings
          setBookings([]);
          setIsLoading(false);
          return;
        }
      } catch (queryError) {
        console.error('Error creating bookings query:', queryError);
        setError('Failed to create query for bookings');
        setIsLoading(false);
        return;
      }

      console.log(`Fetching bookings for user: ${user.id}, userType: ${user.userType}`);

      // Real-time listener for bookings
      unsubscribe = onSnapshot(
        bookingsQuery,
        (snapshot: QuerySnapshot<DocumentData>) => {
          try {
            const bookingData: Booking[] = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                propertyId: data.propertyId,
                tenantId: data.tenantId,
                startDate: data.startDate.toDate(),
                endDate: data.endDate.toDate(),
                status: data.status,
                totalAmount: data.totalAmount,
                paymentStatus: data.paymentStatus,
                notes: data.notes,
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
              };
            });
            
            console.log(`Successfully fetched ${bookingData.length} bookings`);
            setBookings(bookingData);
            setIsLoading(false);
          } catch (parseError) {
            console.error('Error parsing bookings data:', parseError);
            setError('Failed to process bookings data');
            setIsLoading(false);
          }
        },
        (err: FirestoreError) => {
          console.error('Error fetching bookings:', err);
          // Check if this is a permission error
          if (err.code === 'permission-denied') {
            console.log('Permission denied error when fetching bookings. Check Firestore rules.');
            setError('You do not have permission to access bookings');
          } else {
            setError('Failed to load bookings');
          }
          setBookings([]); // Reset bookings on error
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error('Error setting up bookings listener:', err);
      setError('Failed to load bookings');
      setIsLoading(false);
    }

    // Cleanup function
    return () => unsubscribe();
  }, [user]);

  const createBooking = async (
    bookingData: Omit<Booking, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<Booking> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User must be logged in to create bookings');
      }
      
      // Ensure tenant ID is the current user
      if (user.userType !== 'tenant') {
        throw new Error('Only tenants can create bookings');
      }
      
      // Create a new booking document
      const now = Timestamp.now();
      const startDateTimestamp = Timestamp.fromDate(bookingData.startDate);
      const endDateTimestamp = Timestamp.fromDate(bookingData.endDate);
      
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        startDate: startDateTimestamp,
        endDate: endDateTimestamp,
        tenantId: user.id, // Ensure the tenant is the current user
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      });
      
      // Return the new booking data
      const newBooking: Booking = {
        ...bookingData,
        id: bookingRef.id,
        tenantId: user.id,
        status: 'pending',
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
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

  const updateBookingStatus = async (
    id: string,
    status: Booking['status']
  ): Promise<Booking> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User must be logged in to update bookings');
      }
      
      // Get the existing booking
      const existingBooking = bookings.find(b => b.id === id);
      if (!existingBooking) {
        throw new Error('Booking not found');
      }
      
      // Only owners should be able to confirm bookings
      if (status === 'confirmed' && user.userType !== 'owner') {
        throw new Error('Only property owners can confirm bookings');
      }
      
      // Update the booking in Firestore
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, {
        status,
        updatedAt: serverTimestamp(),
      });
      
      // Return the updated booking
      const updatedBooking: Booking = {
        ...existingBooking,
        status,
        updatedAt: new Date(),
      };

      return updatedBooking;
    } catch (err) {
      console.error('Failed to update booking status:', err);
      setError('Failed to update booking status');
      throw new Error('Failed to update booking status');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentStatus = async (
    id: string,
    paymentStatus: Booking['paymentStatus']
  ): Promise<Booking> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User must be logged in to update payment status');
      }
      
      // Get the existing booking
      const existingBooking = bookings.find(b => b.id === id);
      if (!existingBooking) {
        throw new Error('Booking not found');
      }
      
      // Update the booking in Firestore
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, {
        paymentStatus,
        updatedAt: serverTimestamp(),
      });
      
      // Return the updated booking
      const updatedBooking: Booking = {
        ...existingBooking,
        paymentStatus,
        updatedAt: new Date(),
      };

      return updatedBooking;
    } catch (err) {
      console.error('Failed to update payment status:', err);
      setError('Failed to update payment status');
      throw new Error('Failed to update payment status');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (id: string): Promise<Booking> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User must be logged in to cancel bookings');
      }
      
      // Get the existing booking
      const existingBooking = bookings.find(b => b.id === id);
      if (!existingBooking) {
        throw new Error('Booking not found');
      }
      
      // Check if the user is either the tenant or the property owner
      if (existingBooking.tenantId !== user.id && user.userType !== 'owner') {
        throw new Error('You can only cancel your own bookings');
      }
      
      // Update the booking in Firestore
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
      
      // Return the updated booking
      const updatedBooking: Booking = {
        ...existingBooking,
        status: 'cancelled',
        updatedAt: new Date(),
      };

      return updatedBooking;
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setError('Failed to cancel booking');
      throw new Error('Failed to cancel booking');
    } finally {
      setIsLoading(false);
    }
  };

  const getBookingsByProperty = (propertyId: string): Booking[] => {
    return bookings.filter(booking => booking.propertyId === propertyId);
  };

  const getBookingsByTenant = (tenantId: string): Booking[] => {
    return bookings.filter(booking => booking.tenantId === tenantId);
  };

  const value = {
    bookings,
    isLoading,
    error,
    createBooking,
    updateBookingStatus,
    updatePaymentStatus,
    cancelBooking,
    getBookingsByProperty,
    getBookingsByTenant,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}; 