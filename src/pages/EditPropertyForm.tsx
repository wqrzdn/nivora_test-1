import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperty } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import PropertyForm from './PropertyForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const EditPropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPropertyById, isLoading: isPropertyLoading } = useProperty();
  const { user } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError('Property ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        const propertyData = await getPropertyById(id);
        
        if (!propertyData) {
          setError('Property not found');
          setIsLoading(false);
          return;
        }

        // Check if the current user is the owner of this property
        if (user?.id !== propertyData.ownerId) {
          setError('You do not have permission to edit this property');
          setIsLoading(false);
          return;
        }

        setProperty(propertyData);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id, getPropertyById, user]);

  if (isLoading || isPropertyLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={() => navigate('/owner')} 
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Property not found or you don't have permission to edit it.</p>
              <button 
                onClick={() => navigate('/owner')} 
                className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Property</h1>
        <p className="text-gray-600">Update your property listing details</p>
      </div>
      
      <PropertyForm isEditing={true} propertyData={property} />
    </div>
  );
};

export default EditPropertyForm;
