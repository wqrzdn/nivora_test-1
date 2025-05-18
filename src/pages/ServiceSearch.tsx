import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, Star, AlertCircle } from 'lucide-react';
import { useService } from '../context/ServiceContext';
import { useAuth } from '../context/AuthContext';
import ServiceBookingModal from '../components/services/ServiceBookingModal';

const ServiceSearch: React.FC = () => {
  const { services, isLoading, error } = useService();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [bookingService, setBookingService] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  const categories = [
    'electrician',
    'plumber',
    'painter',
    'carpenter',
    'cleaner',
    'gardener',
    'other'
  ];
  
  // Add debug effect to log services and any errors
  useEffect(() => {
    if (services.length === 0 && !isLoading) {
      console.log('No services found. User type:', user?.userType);
      setDebugInfo('No services available. This could be due to permission issues or no services have been added yet.');
    } else {
      console.log(`Found ${services.length} services. User type:`, user?.userType);
      setDebugInfo(null);
    }
    
    if (error) {
      console.error('Service context error:', error);
      setDebugInfo(`Error loading services: ${error}`);
    }
  }, [services, isLoading, error, user]);
  
  // Extract unique cities from services (with error handling)
  const cities = services && services.length > 0 ? 
    [...new Set(services.map(service => service.location.city))] : [];
  
  // Filter services based on search and filters (with error handling)
  const filteredServices = services ? services.filter(service => {
    const matchesSearch = searchTerm === '' || 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || service.category === selectedCategory;
    const matchesCity = selectedCity === '' || service.location.city === selectedCity;
    
    return matchesSearch && matchesCategory && matchesCity;
  }) : [];
  
  const handleBookService = (serviceId: string) => {
    setBookingService(serviceId);
  };
  
  const handleCloseBookingModal = () => {
    setBookingService(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Find Services</h1>
        
        <div className="w-full md:w-auto flex items-center">
          <div className="relative flex-grow mr-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
          >
            <Filter className="h-5 w-5 mr-2 text-gray-500" />
            <span>Filters</span>
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <select
                id="city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedCity('');
              }}
              className="mr-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-500"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
      
      {debugInfo && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-sm text-yellow-700">{debugInfo}</p>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading services...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">Error loading services: {error}</p>
          </div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-500">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                {service.images && service.images.length > 0 ? (
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                    No image
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">{service.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{service.location.city}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    Available: {service.availability.days.join(', ')} 
                    ({service.availability.startTime} - {service.availability.endTime})
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">
                    ₹{service.price}{service.priceType === 'hourly' ? '/hr' : ''}
                  </span>
                  
                  {service.rating ? (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>{service.rating} ({service.reviewCount})</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No ratings yet</span>
                  )}
                </div>
                
                <button
                  onClick={() => handleBookService(service.id)}
                  className="w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {bookingService && (
        <ServiceBookingModal
          serviceId={bookingService}
          onClose={handleCloseBookingModal}
        />
      )}
    </div>
  );
};

export default ServiceSearch;
