import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, DollarSign, Home, BedDouble, Bath, Calendar, Filter, Grid, Map, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProperty } from '../context/PropertyContext';
import { Property } from '../context/PropertyContext';

// Define a type that works with both mock data and Property type
interface DisplayProperty {
  id: string;
  title: string;
  location?: string;
  city?: string;
  state?: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  propertyType?: string;
  type?: 'house' | 'apartment' | 'commercial';
  imageUrl?: string;
  images?: string[];
  status?: string;
  ownerId?: string;
  area?: number;
  address?: string;
}

interface PropertySearchProps {
  ownerView?: boolean;
}

const PropertySearch: React.FC<PropertySearchProps> = ({ ownerView = false }) => {
  const { user } = useAuth();
  const { properties, isLoading, deleteProperty } = useProperty();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    propertyType: '',
    furnished: '',
  });

  // Map real properties to display format
  const formattedProperties: DisplayProperty[] = properties.map(property => ({
    id: property.id,
    title: property.title,
    city: property.city,
    state: property.state,
    rent: property.rent,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    type: property.type,
    images: property.images,
    status: property.status,
    ownerId: property.ownerId,
    area: property.area,
    address: property.address
  }));
  
  // Filter properties based on ownership or filter criteria
  const filteredProperties = ownerView && user 
    ? formattedProperties.filter(property => property.ownerId === user.id)
    : formattedProperties;

  // Apply search filters if provided
  const displayProperties = filteredProperties.filter(property => {
    // Apply location filter if provided
    if (filters.location && !(
      property.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
      property.state?.toLowerCase().includes(filters.location.toLowerCase()) ||
      property.address?.toLowerCase().includes(filters.location.toLowerCase())
    )) {
      return false;
    }

    // Apply min price filter if provided
    if (filters.priceMin && property.rent < parseInt(filters.priceMin)) {
      return false;
    }

    // Apply max price filter if provided
    if (filters.priceMax && property.rent > parseInt(filters.priceMax)) {
      return false;
    }

    // Apply bedrooms filter if provided
    if (filters.bedrooms && property.bedrooms < parseInt(filters.bedrooms)) {
      return false;
    }

    // Apply property type filter if provided
    if (filters.propertyType && property.type !== filters.propertyType.toLowerCase()) {
      return false;
    }

    return true;
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleFilters = () => {
    setFilterOpen(prev => !prev);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching with filters:', filters);
    // In a real app, we'd trigger the API call here
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Search Hero */}
      <div className={`${ownerView ? 'bg-secondary-600' : 'bg-primary-600'} text-white py-12`}>
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">
            {ownerView ? 'Manage Your Properties' : 'Find Your Perfect Home'}
          </h1>
          
          {!ownerView && (
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-full relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-300" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    placeholder="Enter location, city, or area"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="pl-10 pr-4 py-3 rounded-md w-full focus:ring-2 focus:ring-primary-300 border-none"
                  />
                </div>
                
                <button 
                  type="button" 
                  onClick={toggleFilters}
                  className="flex items-center gap-2 bg-primary-500 hover:bg-primary-700 py-3 px-4 rounded-md"
                >
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </button>
                
                <button 
                  type="submit" 
                  className="bg-white text-primary-700 hover:bg-gray-100 py-3 px-6 rounded-md font-medium"
                >
                  <Search className="h-5 w-5 inline mr-2" />
                  Search
                </button>
              </div>
              
              {/* Advanced Filters */}
              {filterOpen && (
                <div className="mt-4 bg-white p-6 rounded-md shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                          </div>
                          <input
                            type="number"
                            name="priceMin"
                            placeholder="Min"
                            value={filters.priceMin}
                            onChange={handleFilterChange}
                            className="pl-9 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                        <span>to</span>
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                          </div>
                          <input
                            type="number"
                            name="priceMax"
                            placeholder="Max"
                            value={filters.priceMax}
                            onChange={handleFilterChange}
                            className="pl-9 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                      <select
                        name="propertyType"
                        value={filters.propertyType}
                        onChange={handleFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="">All Types</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                      <select
                        name="bedrooms"
                        value={filters.bedrooms}
                        onChange={handleFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="">Any</option>
                        <option value="1">1 or more</option>
                        <option value="2">2 or more</option>
                        <option value="3">3 or more</option>
                        <option value="4">4 or more</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Furnished Status</label>
                      <select
                        name="furnished"
                        value={filters.furnished}
                        onChange={handleFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="">Any</option>
                        <option value="fully-furnished">Fully Furnished</option>
                        <option value="semi-furnished">Semi-Furnished</option>
                        <option value="unfurnished">Unfurnished</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
          
          {ownerView && (
            <div className="max-w-4xl mx-auto text-center">
              <Link 
                to="/owner/properties/new" 
                className="inline-flex items-center bg-white text-secondary-700 hover:bg-gray-100 py-3 px-6 rounded-md font-medium"
              >
                <Home className="h-5 w-5 mr-2" />
                Add New Property
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Properties List */}
      <div className="container mx-auto mt-8 px-4 md:px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {ownerView ? 'Your Listed Properties' : 'Available Properties'}
            {displayProperties.length > 0 && ` (${displayProperties.length})`}
          </h2>
          
          {!ownerView && (
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode('map')} 
                className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}
              >
                <Map className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProperties.length > 0 ? (
              displayProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <img 
                    src={property.images && property.images[0] ? property.images[0] : 'https://via.placeholder.com/400x200?text=No+Image'} 
                    alt={property.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.address || (property.city && property.state ? `${property.city}, ${property.state}` : 'Location not specified')}</span>
                    </div>
                    <div className="text-primary-600 font-medium mb-3">
                      ₹{property.rent.toLocaleString()}/month
                    </div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center text-gray-700 text-sm">
                        <BedDouble className="h-4 w-4 mr-1" />
                        <span>{property.bedrooms} Bed</span>
                      </div>
                      <div className="flex items-center text-gray-700 text-sm">
                        <Bath className="h-4 w-4 mr-1" />
                        <span>{property.bathrooms} Bath</span>
                      </div>
                      <div className="flex items-center text-gray-700 text-sm">
                        <Home className="h-4 w-4 mr-1" />
                        <span>{property.type || 'Property'}</span>
                      </div>
                    </div>
                    
                    {ownerView ? (
                      <div className="flex justify-between">
                        <Link 
                          to={`/owner/properties/${property.id}/edit`} 
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                        <button 
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this property?")) {
                              deleteProperty(property.id);
                            }
                          }}
                          className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                        <Link 
                          to={`/properties/${property.id}`}
                          className="inline-flex items-center px-3 py-2 border border-primary-300 rounded-md text-sm font-medium text-primary-700 bg-white hover:bg-primary-50"
                        >
                          View
                        </Link>
                      </div>
                    ) : (
                      <Link 
                        to={`/properties/${property.id}`}
                        className="block w-full text-center py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="text-gray-500 mb-4">
                  <Home className="h-12 w-12 mx-auto mb-2" />
                  {ownerView ? (
                    <>
                      <h3 className="text-lg font-medium mb-2">No properties listed yet</h3>
                      <p className="text-gray-600 mb-4">Start adding your properties to list them for rent</p>
                      <Link to="/owner/properties/new" className="btn btn-primary">
                        Add Property
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium mb-2">No properties found</h3>
                      <p className="text-gray-600 mb-4">Try changing your search criteria</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Map view is not implemented in this demo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertySearch; 