import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

export interface Application {
  id: string;
  propertyId: string;
  tenantId: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ApplicationContextType {
  applications: Application[];
  isLoading: boolean;
  error: string | null;
  submitApplication: (application: Omit<Application, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<Application>;
  updateApplicationStatus: (id: string, status: Application['status']) => Promise<Application>;
  getApplicationsByProperty: (propertyId: string) => Application[];
  getApplicationsByTenant: (tenantId: string) => Application[];
  deleteApplication: (id: string) => Promise<void>;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setApplications([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null); // Reset error state
    
    try {
      console.log('Fetching applications for user type:', user.userType);
      
      let applicationsQuery;
      
      if (user.userType === 'owner') {
        applicationsQuery = query(
          collection(db, 'applications'),
          orderBy('createdAt', 'desc')
        );
      } else {
        applicationsQuery = query(
          collection(db, 'applications'),
          where('tenantId', '==', user.id),
          orderBy('createdAt', 'desc')
        );
      }

      const unsubscribe = onSnapshot(
        applicationsQuery,
        (snapshot) => {
          try {
            console.log(`Received ${snapshot.docs.length} applications from Firestore`);
            const applicationData: Application[] = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                propertyId: data.propertyId,
                tenantId: data.tenantId,
                status: data.status,
                message: data.message,
                documents: data.documents,
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
              };
            });
            
            let filteredApplications = applicationData;
            if (user.userType === 'owner') {
            }
            
            setApplications(filteredApplications);
            setError(null);
          } catch (parseError) {
            console.error('Error parsing application data:', parseError);
            setError('Error processing application data');
            setApplications([]);
          } finally {
            setIsLoading(false);
          }
        },
        (err) => {
          console.error('Error fetching applications:', err);
          if (err.code === 'permission-denied') {
            setError('You do not have permission to view applications. Please check your account type.');
          } else {
            setError(`Failed to load applications: ${err.message}`);
          }
          setApplications([]);
          setIsLoading(false);
        }
      );
      
      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up applications listener:', error);
      setError('Failed to initialize applications');
      setIsLoading(false);
      return () => {};
    }
  }, [user]);

  const submitApplication = async (
    applicationData: Omit<Application, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<Application> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User must be logged in to submit applications');
      }
      
      // Create a new application document
      const now = Timestamp.now();
      const applicationRef = await addDoc(collection(db, 'applications'), {
        ...applicationData,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      });
      
      // Return the new application data
      const newApplication: Application = {
        ...applicationData,
        id: applicationRef.id,
        status: 'pending',
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };

      return newApplication;
    } catch (err) {
      console.error('Failed to submit application:', err);
      setError('Failed to submit application');
      throw new Error('Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (
    id: string,
    status: Application['status']
  ): Promise<Application> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User must be logged in to update application status');
      }
      
      // Update the application in Firestore
      const applicationRef = doc(db, 'applications', id);
      await updateDoc(applicationRef, {
        status,
        updatedAt: serverTimestamp(),
      });
      
      // Find the updated application in the state
      const updatedApplication = applications.find(app => app.id === id);
      if (!updatedApplication) {
        throw new Error('Application not found');
      }
      
      // Return the updated application with new status
      return {
        ...updatedApplication,
        status,
        updatedAt: new Date(),
      };
    } catch (err) {
      console.error('Failed to update application status:', err);
      setError('Failed to update application status');
      throw new Error('Failed to update application status');
    } finally {
      setIsLoading(false);
    }
  };

  const getApplicationsByProperty = (propertyId: string): Application[] => {
    return applications.filter(app => app.propertyId === propertyId);
  };

  const getApplicationsByTenant = (tenantId: string): Application[] => {
    return applications.filter(app => app.tenantId === tenantId);
  };

  const deleteApplication = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User must be logged in to delete applications');
      }
      
      // Delete the application from Firestore
      await deleteDoc(doc(db, 'applications', id));
    } catch (err) {
      console.error('Failed to delete application:', err);
      setError('Failed to delete application');
      throw new Error('Failed to delete application');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    applications,
    isLoading,
    error,
    submitApplication,
    updateApplicationStatus,
    getApplicationsByProperty,
    getApplicationsByTenant,
    deleteApplication,
  };

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
};

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
}; 