import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, MessageSquare, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProperty } from '../context/PropertyContext';

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { properties, isLoading, deleteProperty } = useProperty();
  
  // Filter properties owned by the current user
  const userProperties = user ? properties.filter(property => property.ownerId === user.id) : [];

  // We'll implement this in a future update when adding message notifications

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(propertyId);
      } catch (error) {
        console.error('Error deleting property:', error);
        // In a real app, show error notification
      }
    }
  };

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstName}</h1>
          <p className="text-gray-600">Manage your properties and tenant interactions</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link 
              to="/owner/properties/new" 
              className="flex items-center justify-center p-6 bg-primary-50 border border-primary-100 rounded-lg hover:bg-primary-100 transition"
            >
              <Plus className="w-5 h-5 mr-2 text-primary-600" />
              <span className="font-medium">Add Property</span>
            </Link>
            <Link 
              to="/owner/applications" 
              className="flex items-center justify-center p-6 bg-secondary-50 border border-secondary-100 rounded-lg hover:bg-secondary-100 transition"
            >
              <Users className="w-5 h-5 mr-2 text-secondary-600" />
              <span className="font-medium">Applications</span>
            </Link>
            <Link 
              to="/owner/messages" 
              className="flex items-center justify-center p-6 bg-secondary-50 border border-secondary-100 rounded-lg hover:bg-secondary-100 transition"
            >
              <MessageSquare className="w-5 h-5 mr-2 text-secondary-600" />
              <span className="font-medium">Messages</span>
            </Link>
            <Link 
              to="/owner/agreements" 
              className="flex items-center justify-center p-6 bg-secondary-50 border border-secondary-100 rounded-lg hover:bg-secondary-100 transition"
            >
              <FileText className="w-5 h-5 mr-2 text-secondary-600" />
              <span className="font-medium">Agreements</span>
            </Link>
          </div>
        </div>

        {/* Properties Overview */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Properties</h2>
            <Link to="/owner/properties" className="text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : userProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {/* Property Image */}
                  {property.images && property.images.length > 0 && (
                    <div className="mb-4 rounded-lg overflow-hidden h-48">
                      <img 
                        src={property.images[0]} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load property image:', property.images[0]);
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
                        }}
                        onLoad={() => console.log('Successfully loaded property image:', property.images[0])}
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                      <p className="text-gray-600 mb-2">{property.city}, {property.state}</p>
                      <p className="text-primary-600 font-medium">₹{property.rent.toLocaleString()}/month</p>
                    </div>
                    <div className="bg-primary-50 text-primary-600 font-medium rounded-full px-3 py-1 text-sm">
                      {property.status}
                    </div>
                  </div>
                  
                  {/* Property Stats */}
                  <div className="grid grid-cols-3 gap-4 my-4 py-4 border-y border-gray-100">
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">Applications</p>
                      <p className="font-semibold">0</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">Views</p>
                      <p className="font-semibold">0</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">Messages</p>
                      <p className="font-semibold">0</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      to={`/owner/properties/${property.id}`}
                      className="flex-1 px-4 py-2 bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100 transition text-center"
                    >
                      View Details
                    </Link>
                    <Link 
                      to={`/owner/properties/${property.id}/edit`}
                      className="p-2 text-gray-600 hover:text-primary-600 rounded-md hover:bg-gray-100 transition"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteProperty(property.id)}
                      className="p-2 text-gray-600 hover:text-red-600 rounded-md hover:bg-gray-100 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Home className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No properties listed yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first property</p>
              <Link to="/owner/properties/new" className="btn btn-primary">
                Add Property
              </Link>
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Messages</h2>
            <Link to="/owner/messages" className="text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>

          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No messages yet</h3>
            <p className="text-gray-600">Messages from tenants will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard; 