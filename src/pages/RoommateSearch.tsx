import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Search, Filter, Users, MessageSquare, Plus } from 'lucide-react';
import { useRoommate } from '../context/RoommateContext';
import { useAuth } from '../context/AuthContext';
import RoommateProfileCard from '../components/profile/RoommateProfileCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const RoommateSearch: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { userProfile, searchProfiles, recommendedMatches, isLoading } = useRoommate();
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  const [filters, setFilters] = useState({
    location: '',
    budgetMin: '',
    budgetMax: '',
    smoking: false,
    pets: false,
    drinking: false,
  });

  // Load recommended matches on component mount
  useEffect(() => {
    if (recommendedMatches.length > 0) {
      setSearchResults(recommendedMatches);
    }
  }, [recommendedMatches]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFilters(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      location: e.target.value
    }));
  };

  const toggleFilters = () => {
    setFilterOpen(prev => !prev);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSearching(true);
    setSearchPerformed(true);
    
    try {
      // Convert filter values to the format expected by the search function
      const searchFilters = {
        locations: filters.location ? [filters.location] : [],
        budget: {
          min: filters.budgetMin ? parseInt(filters.budgetMin) : undefined,
          max: filters.budgetMax ? parseInt(filters.budgetMax) : undefined
        },
        lifestyle: {
          smoking: filters.smoking,
          pets: filters.pets,
          drinking: filters.drinking
        }
      };
      
      const results = await searchProfiles(searchFilters);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for roommates:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateProfile = () => {
    if (isAuthenticated) {
      navigate('/roommates/create-profile');
    } else {
      navigate('/login', { state: { from: '/roommates/create-profile' } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Search Hero */}
      <div className="bg-primary-600 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-2 text-center">Find Your Perfect Roommate</h1>
          <p className="text-center mb-8 text-primary-100">
            Connect with like-minded people looking for roommates
          </p>
          
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
                  onChange={handleLocationChange}
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
                disabled={isSearching}
              >
                <Search className="h-5 w-5 inline mr-2" />
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            {/* Advanced Filters */}
            {filterOpen && (
              <div className="mt-4 bg-white p-6 rounded-md shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                        </div>
                        <input
                          type="number"
                          name="budgetMin"
                          placeholder="Min"
                          value={filters.budgetMin}
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
                          name="budgetMax"
                          placeholder="Max"
                          value={filters.budgetMax}
                          onChange={handleFilterChange}
                          className="pl-9 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Lifestyle Preferences</label>
                    <div className="flex flex-col space-y-2">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="smoking"
                          checked={filters.smoking}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Smoking Friendly</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pets"
                          checked={filters.pets}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Pet Friendly</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="drinking"
                          checked={filters.drinking}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Drinking Friendly</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Left Column - Roommate Profiles */}
          <div className="w-full md:w-8/12 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {searchPerformed ? 'Search Results' : 'Recommended Roommates'}
              </h2>
              
              {!userProfile ? (
                <button 
                  onClick={handleCreateProfile}
                  className="btn btn-primary btn-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Your Profile
                </button>
              ) : (
                <Link to="/roommates/edit-profile" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                  Edit Your Profile
                </Link>
              )}
            </div>
            
            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}
            
            {/* No Results State */}
            {!isLoading && searchResults.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No roommates found</h3>
                <p className="text-gray-500 mb-6">
                  {searchPerformed 
                    ? "We couldn't find any roommates matching your search criteria. Try adjusting your filters."
                    : "Create your profile to get matched with potential roommates."}
                </p>
                {!userProfile && (
                  <button
                    onClick={handleCreateProfile}
                    className="btn btn-primary"
                  >
                    Create Your Roommate Profile
                  </button>
                )}
              </div>
            )}
            
            {/* Roommate Cards */}
            {!isLoading && searchResults.length > 0 && (
              <div className="space-y-4">
                {searchResults.map(profile => (
                  <RoommateProfileCard 
                    key={profile.id} 
                    profile={profile} 
                    compatibilityScore={Math.floor(Math.random() * 30) + 70} // This would be calculated by your algorithm
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Right Column - Tips & Information */}
          <div className="w-full md:w-4/12 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Finding a Roommate</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <Users className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Create your profile to appear in search results</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5">★</span>
                  <span>Be honest about your lifestyle and preferences</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5">♥</span>
                  <span>Our matching algorithm finds compatible roommates</span>
                </li>
                <li className="flex items-start">
                  <MessageSquare className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Message potential roommates to get to know them</span>
                </li>
              </ul>
              
              <div className="mt-6">
                <Link 
                  to="/roommates/how-it-works"
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  Learn more about finding roommates
                </Link>
              </div>
            </div>
            
            <div className="bg-primary-50 p-6 rounded-lg border border-primary-100">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">Safety Tips</h3>
              <p className="text-sm text-primary-800 mb-4">
                Always prioritize your safety when meeting potential roommates.
              </p>
              <ul className="space-y-2 text-sm text-primary-800">
                <li>• Meet in public places first</li>
                <li>• Verify their identity and references</li>
                <li>• Trust your instincts</li>
                <li>• Consider a trial period before committing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoommateSearch;
