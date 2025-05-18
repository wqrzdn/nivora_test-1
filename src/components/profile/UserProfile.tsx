import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { User } from '../../context/AuthContext';
import { MessageSquare, Calendar, Mail, Phone } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) {
        setError('User ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userDoc = await getDoc(doc(db, 'users', id));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setProfileUser({
            ...userData,
            id: userDoc.id
          });
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-700">{error || 'User information unavailable'}</p>
          <Link to="/" className="mt-4 inline-block text-primary-600 hover:text-primary-800">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isCurrentUser = currentUser && currentUser.id === profileUser.id;
  const fullName = `${profileUser.firstName} ${profileUser.lastName}`;
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-primary-600 h-32 relative"></div>
            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-4">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                  <img 
                    src={profileUser.avatarUrl || 'https://via.placeholder.com/150?text=User'} 
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold">{fullName}</h1>
                  <div className="flex items-center mt-1 text-gray-600">
                    <span className="capitalize bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium">
                      {profileUser.userType.replace('-', ' ')}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm">Member since {new Date().getFullYear()}</span>
                    </span>
                  </div>
                </div>
                {!isCurrentUser && (
                  <Link 
                    to={`/messages/${profileUser.id}`}
                    className="btn btn-primary flex items-center mt-4 md:mt-0"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - User Info */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                {profileUser.bio ? (
                  <p className="text-gray-700 whitespace-pre-line">{profileUser.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">No bio provided</p>
                )}
              </div>

              {/* If user is a property owner, show their properties */}
              {profileUser.userType === 'owner' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Properties</h2>
                  <p className="text-gray-500">Properties listed by this owner will appear here.</p>
                  {/* Here you would fetch and display the user's properties */}
                </div>
              )}

              {/* If user is a service provider, show their services */}
              {profileUser.userType === 'service-provider' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Services</h2>
                  {profileUser.serviceCategory && (
                    <div className="mb-4">
                      <span className="font-medium">Category: </span>
                      <span className="capitalize">{profileUser.serviceCategory}</span>
                    </div>
                  )}
                  <p className="text-gray-500">Services offered by this provider will appear here.</p>
                  {/* Here you would fetch and display the user's services */}
                </div>
              )}
            </div>

            {/* Right Column - Contact Info */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <ul className="space-y-3">
                  {profileUser.email && (
                    <li className="flex items-start">
                      <Mail className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="text-gray-800">{profileUser.email}</div>
                      </div>
                    </li>
                  )}
                  {profileUser.phone && (
                    <li className="flex items-start">
                      <Phone className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Phone</div>
                        <div className="text-gray-800">{profileUser.phone}</div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              {/* Additional Info for Service Providers */}
              {profileUser.userType === 'service-provider' && profileUser.serviceAreas && (
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h2 className="text-lg font-semibold mb-3">Service Areas</h2>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.serviceAreas.map((area, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
