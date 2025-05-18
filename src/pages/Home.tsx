import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Home as HomeIcon, RefreshCw } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Find Your Perfect Home and Roommate</h1>
            <p className="text-xl mb-8">
              Nivora makes it easy to find your ideal rental property and compatible roommates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/properties" className="btn bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 rounded-md font-medium">
                Browse Properties
              </Link>
              <Link to="/roommates" className="btn bg-primary-500 text-white hover:bg-primary-600 border border-white px-6 py-3 rounded-md font-medium">
                Find Roommates
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How Nivora Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-100 hover:shadow-md transition">
              <div className="w-16 h-16 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Search Properties</h3>
              <p className="text-gray-600">
                Browse through our extensive collection of rental properties with advanced filters.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-100 hover:shadow-md transition">
              <div className="w-16 h-16 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Match with Roommates</h3>
              <p className="text-gray-600">
                Find compatible roommates based on your lifestyle, budget, and preferences.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-100 hover:shadow-md transition">
              <div className="w-16 h-16 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mb-4">
                <HomeIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Your Home</h3>
              <p className="text-gray-600">
                Apply for properties, chat with owners, and finalize your rental agreement.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-100 hover:shadow-md transition">
              <div className="w-16 h-16 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mb-4">
                <RefreshCw className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage Rentals</h3>
              <p className="text-gray-600">
                For owners: list, manage, and find qualified tenants for your properties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Find Your Perfect Match?</h2>
            <p className="text-xl mb-8">
              Join thousands of users who found their ideal home and roommates with Nivora.
            </p>
            <Link to="/register" className="btn btn-primary px-8 py-3 rounded-md text-lg font-medium">
              Get Started Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 