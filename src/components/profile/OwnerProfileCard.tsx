import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { User } from '../../context/AuthContext';
import { MessageSquare } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface OwnerProfileCardProps {
  ownerId: string;
  onMessageClick?: () => void;
}

const OwnerProfileCard: React.FC<OwnerProfileCardProps> = ({ ownerId, onMessageClick }) => {
  const [owner, setOwner] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!ownerId) {
        setIsLoading(false);
        setError('Owner ID is missing');
        return;
      }

      try {
        setIsLoading(true);
        const ownerDoc = await getDoc(doc(db, 'users', ownerId));
        
        if (ownerDoc.exists()) {
          const ownerData = ownerDoc.data() as User;
          setOwner({
            ...ownerData,
            id: ownerDoc.id
          });
        } else {
          setError('Owner not found');
        }
      } catch (err) {
        console.error('Error fetching owner data:', err);
        setError('Failed to load owner information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwnerData();
  }, [ownerId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="p-4 border border-gray-200 rounded-md">
        <p className="text-gray-500 text-sm">{error || 'Owner information unavailable'}</p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex items-center mb-4">
        <Link to={`/profile/${owner.id}`} className="block">
          <img 
            src={owner.avatarUrl || 'https://via.placeholder.com/100?text=User'} 
            alt={`${owner.firstName} ${owner.lastName}`}
            className="w-12 h-12 rounded-full mr-3 object-cover"
          />
        </Link>
        <div>
          <Link to={`/profile/${owner.id}`} className="font-medium text-primary-600 hover:text-primary-800">
            {owner.firstName} {owner.lastName}
          </Link>
          <p className="text-sm text-gray-600">Property Owner</p>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 space-y-2">
        {owner.phone && (
          <div className="flex items-center">
            <span className="font-medium mr-2">Phone:</span>
            <span>{owner.phone}</span>
          </div>
        )}
        
        {owner.bio && (
          <div className="mt-2">
            <span className="font-medium">About:</span>
            <p className="text-gray-700 mt-1 text-sm line-clamp-2">{owner.bio}</p>
          </div>
        )}
        
        <div className="flex justify-between mt-3">
          <button 
            onClick={onMessageClick}
            className="btn btn-sm btn-outline-primary flex items-center"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </button>
          
          <Link 
            to={`/profile/${owner.id}`}
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            View Full Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfileCard;
