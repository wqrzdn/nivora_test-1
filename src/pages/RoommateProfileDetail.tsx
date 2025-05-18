import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoommate } from '../context/RoommateContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { MessageCircle, ArrowLeft } from 'lucide-react';

const RoommateProfileDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProfileById } = useRoommate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      try {
        const profileData = await getProfileById(id);
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [id, getProfileById]);
  
  const handleMessageClick = () => {
    if (user && profile) {
      navigate(`/messages/${profile.userId}`);
    } else {
      navigate('/login', { state: { from: `/roommates/profile/${id}` } });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">The roommate profile you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/roommates')}
            className="btn btn-primary"
          >
            Back to Roommates
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/roommates')}
        className="flex items-center text-primary-600 hover:text-primary-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Roommates
      </button>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="w-full md:w-1/3">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-lg">No Image</span>
                </div>
              )}
              
              <div className="mt-4">
                <button 
                  onClick={handleMessageClick}
                  className="btn btn-primary w-full"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Message {profile.firstName}
                </button>
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="w-full md:w-2/3">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {profile.firstName} {profile.lastName}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Budget Range</h3>
                  <p className="text-base text-gray-900">₹{profile.budget.min.toLocaleString()} - ₹{profile.budget.max.toLocaleString()}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Preferred Locations</h3>
                  <p className="text-base text-gray-900">{profile.preferredLocations.join(', ')}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About Me</h2>
                <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">What I'm Looking For</h2>
                <p className="text-gray-700 whitespace-pre-line">{profile.lookingFor}</p>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Lifestyle Preferences</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className={`px-3 py-2 rounded-md ${profile.lifestyle.smoking ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {profile.lifestyle.smoking ? 'Smoking Friendly' : 'No Smoking'}
                  </div>
                  
                  <div className={`px-3 py-2 rounded-md ${profile.lifestyle.pets ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {profile.lifestyle.pets ? 'Pet Friendly' : 'No Pets'}
                  </div>
                  
                  <div className={`px-3 py-2 rounded-md ${profile.lifestyle.drinking ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {profile.lifestyle.drinking ? 'Drinking Friendly' : 'No Drinking'}
                  </div>
                  
                  {profile.lifestyle.foodPreference && (
                    <div className="px-3 py-2 rounded-md bg-blue-50 text-blue-700">
                      {profile.lifestyle.foodPreference === 'vegetarian' 
                        ? 'Vegetarian' 
                        : profile.lifestyle.foodPreference === 'vegan'
                          ? 'Vegan'
                          : profile.lifestyle.foodPreference === 'non-vegetarian'
                            ? 'Non-Vegetarian'
                            : 'No Food Preference'}
                    </div>
                  )}
                  
                  {profile.lifestyle.workSchedule && (
                    <div className="px-3 py-2 rounded-md bg-purple-50 text-purple-700">
                      {profile.lifestyle.workSchedule === 'day' 
                        ? 'Day Shift' 
                        : profile.lifestyle.workSchedule === 'night'
                          ? 'Night Shift'
                          : 'Flexible Schedule'}
                    </div>
                  )}
                  
                  {profile.lifestyle.cleanliness && (
                    <div className="px-3 py-2 rounded-md bg-yellow-50 text-yellow-700">
                      {profile.lifestyle.cleanliness === 'very-clean' 
                        ? 'Very Clean' 
                        : profile.lifestyle.cleanliness === 'clean'
                          ? 'Clean'
                          : profile.lifestyle.cleanliness === 'moderate'
                            ? 'Moderately Clean'
                            : 'Relaxed Cleaning'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoommateProfileDetail;
