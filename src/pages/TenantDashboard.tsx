import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, MessageSquare, Heart, File, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProperty } from '../context/PropertyContext';

const TenantDashboard: React.FC = () => {
  const { user } = useAuth();
  const { properties, isLoading } = useProperty();
  
  // We would normally fetch saved properties from an API
  // For demo, we'll simulate that no saved properties exist yet
  const savedProperties: any[] = [];
  
  // Real apps would fetch these from an API
  const recentMessages: any[] = []; 
  const applications: any[] = [];

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstName}</h1>
          <p className="text-gray-600">Find your perfect home</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link 
              to="/tenant/properties" 
              className="flex items-center justify-center p-6 bg-primary-50 border border-primary-100 rounded-lg hover:bg-primary-100 transition"
            >
              <Search className="w-5 h-5 mr-2 text-primary-600" />
              <span className="font-medium">Search Properties</span>
            </Link>
            <Link 
              to="/tenant/saved" 
              className="flex items-center justify-center p-6 bg-secondary-50 border border-secondary-100 rounded-lg hover:bg-secondary-100 transition"
            >
              <Heart className="w-5 h-5 mr-2 text-secondary-600" />
              <span className="font-medium">Saved Listings</span>
            </Link>
            <Link 
              to="/tenant/messages" 
              className="flex items-center justify-center p-6 bg-secondary-50 border border-secondary-100 rounded-lg hover:bg-secondary-100 transition"
            >
              <MessageSquare className="w-5 h-5 mr-2 text-secondary-600" />
              <span className="font-medium">Check Messages</span>
            </Link>
            <Link 
              to="/tenant/applications" 
              className="flex items-center justify-center p-6 bg-secondary-50 border border-secondary-100 rounded-lg hover:bg-secondary-100 transition"
            >
              <File className="w-5 h-5 mr-2 text-secondary-600" />
              <span className="font-medium">Application Status</span>
            </Link>
          </div>
        </div>

        {/* Saved Properties */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Saved Properties</h2>
            <Link to="/tenant/saved" className="text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : savedProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedProperties.map((property) => (
                <div key={property.id} className="card p-6">
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
                  <div className="flex mt-4 space-x-2">
                    <Link to={`/properties/${property.id}`} className="btn btn-outline text-sm">
                      View Details
                    </Link>
                    <button className="btn btn-primary text-sm">
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No saved properties yet</h3>
              <p className="text-gray-600 mb-4">Save properties to view them later</p>
              <Link to="/tenant/properties" className="btn btn-primary">
                Browse Properties
              </Link>
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
            <Link to="/tenant/applications" className="text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>

          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <File className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-4">Apply to properties to see them here</p>
            <Link to="/tenant/properties" className="btn btn-primary">
              Browse Properties
            </Link>
          </div>
        </div>

        {/* Recent Messages */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Messages</h2>
            <Link to="/tenant/messages" className="text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>

          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No messages yet</h3>
            <p className="text-gray-600">Messages from property owners will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard; 