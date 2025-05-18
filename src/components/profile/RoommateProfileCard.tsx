import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, User } from 'lucide-react';
import { RoommateProfile } from '../../context/RoommateContext';
import { useAuth } from '../../context/AuthContext';

interface RoommateProfileCardProps {
  profile: RoommateProfile;
  compatibilityScore?: number;
  showActions?: boolean;
}

const RoommateProfileCard: React.FC<RoommateProfileCardProps> = ({ 
  profile, 
  compatibilityScore,
  showActions = true
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const handleMessageClick = () => {
    if (user) {
      navigate(`/messages/${profile.userId}`);
    } else {
      navigate('/login', { state: { from: `/roommates` } });
    }
  };

  const handleViewProfile = () => {
    navigate(`/roommates/profile/${profile.id}`);
  };

  // Format budget range
  const budgetRange = `₹${profile.budget.min.toLocaleString()} - ₹${profile.budget.max.toLocaleString()}`;

  // Get lifestyle preferences as readable text
  const getLifestyleText = () => {
    const preferences = [];
    
    if (profile.lifestyle.smoking) preferences.push('Smoking friendly');
    if (profile.lifestyle.pets) preferences.push('Pet friendly');
    if (profile.lifestyle.drinking) preferences.push('Drinking friendly');
    
    if (profile.lifestyle.foodPreference && profile.lifestyle.foodPreference !== 'no-preference') {
      preferences.push(profile.lifestyle.foodPreference === 'vegetarian' 
        ? 'Vegetarian' 
        : profile.lifestyle.foodPreference === 'vegan'
          ? 'Vegan'
          : 'Non-vegetarian');
    }
    
    if (profile.lifestyle.cleanliness) {
      const cleanlinessMap = {
        'very-clean': 'Very clean',
        'clean': 'Clean',
        'moderate': 'Moderately clean',
        'relaxed': 'Relaxed about cleaning'
      };
      
      preferences.push(cleanlinessMap[profile.lifestyle.cleanliness as keyof typeof cleanlinessMap] || '');
    }
    
    if (profile.lifestyle.workSchedule) {
      const scheduleMap = {
        'day': 'Day shift worker',
        'night': 'Night shift worker',
        'flexible': 'Flexible work hours'
      };
      
      preferences.push(scheduleMap[profile.lifestyle.workSchedule as keyof typeof scheduleMap] || '');
    }
    
    return preferences.join(' • ');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={`${profile.firstName} ${profile.lastName}`}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-500" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {profile.firstName} {profile.lastName.charAt(0)}.
                </h3>
                <p className="text-sm text-gray-500">
                  Looking in: {profile.preferredLocations.join(', ')}
                </p>
              </div>
              
              {compatibilityScore !== undefined && (
                <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                  {compatibilityScore}% Match
                </div>
              )}
            </div>
            
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Budget: {budgetRange}</p>
              <p className="text-xs text-gray-500 mt-1">{getLifestyleText()}</p>
            </div>
            
            <div className="mt-3">
              <p className="text-sm text-gray-700 line-clamp-2">
                {expanded ? profile.bio : `${profile.bio.substring(0, 120)}${profile.bio.length > 120 ? '...' : ''}`}
              </p>
              {profile.bio.length > 120 && (
                <button 
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-primary-600 hover:text-primary-800 mt-1"
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
            
            {showActions && (
              <div className="mt-4 flex space-x-3">
                <button 
                  onClick={handleViewProfile}
                  className="btn btn-outline-primary btn-sm"
                >
                  View Profile
                </button>
                <button 
                  onClick={handleMessageClick}
                  className="btn btn-primary btn-sm"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoommateProfileCard;
