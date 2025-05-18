import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  userType: 'owner' | 'tenant';
}

const NewMessageButton: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users from Firestore
  useEffect(() => {
    if (showModal) {
      const fetchUsers = async () => {
        setIsLoading(true);
        try {
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const usersData = usersSnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data() as Omit<User, 'id'>
            }))
            .filter(user => user.id !== currentUser?.id); // Exclude current user
            
          setUsers(usersData);
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUsers();
    }
  }, [showModal, currentUser]);

  const filteredUsers = searchTerm.trim() === '' 
    ? users 
    : users.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const handleUserSelect = (userId: string) => {
    setShowModal(false);
    navigate(`/messages/${userId}`);
  };

  return (
    <>
      <button 
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
        onClick={() => setShowModal(true)}
      >
        New Message
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">New Message</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No users found</div>
                ) : (
                  <ul className="space-y-2">
                    {filteredUsers.map(user => (
                      <li 
                        key={user.id} 
                        className="flex items-center p-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                        onClick={() => handleUserSelect(user.id)}
                      >
                        <div className="bg-primary-100 text-primary-800 rounded-full h-10 w-10 flex items-center justify-center font-medium mr-3">
                          {user.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.userType === 'owner' ? 'Property Owner' : 'Tenant'}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewMessageButton; 