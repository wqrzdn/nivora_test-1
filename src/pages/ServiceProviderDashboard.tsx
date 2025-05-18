import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useService } from '../context/ServiceContext';
import { useServiceBooking } from '../context/ServiceBookingContext';
import ServiceForm from '../components/services/ServiceForm';

const ServiceProviderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { services, isLoading: servicesLoading, getServicesByProvider, deleteService } = useService();
  const { bookings, isLoading: bookingsLoading, updateBookingStatus } = useServiceBooking();
  
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'bookings'>('services');

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Please log in to access your dashboard</p>
      </div>
    );
  }

  if (user.userType !== 'service-provider') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>This dashboard is only accessible to service providers</p>
      </div>
    );
  }

  const myServices = getServicesByProvider(user.id);
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
  const completedBookings = bookings.filter(booking => booking.status === 'completed');
  const cancelledBookings = bookings.filter(booking => booking.status === 'cancelled');

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(serviceId);
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleEditService = (serviceId: string) => {
    setEditingService(serviceId);
    setShowServiceForm(true);
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await updateBookingStatus(bookingId, status);
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Service Provider Dashboard</h1>
        {!showServiceForm && (
          <button
            onClick={() => {
              setEditingService(null);
              setShowServiceForm(true);
            }}
            className="btn btn-primary flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Service
          </button>
        )}
      </div>

      {showServiceForm ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </h2>
          <ServiceForm
            serviceId={editingService}
            onCancel={() => setShowServiceForm(false)}
            onSuccess={() => setShowServiceForm(false)}
          />
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('services')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'services'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Services
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'bookings'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Bookings
                  {pendingBookings.length > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      {pendingBookings.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'services' ? (
            <>
              {servicesLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading services...</p>
                </div>
              ) : myServices.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No services yet</h3>
                  <p className="text-gray-500 mb-4">
                    Start by adding your first service to attract customers.
                  </p>
                  <button
                    onClick={() => {
                      setEditingService(null);
                      setShowServiceForm(true);
                    }}
                    className="btn btn-primary"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add New Service
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myServices.map((service) => (
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
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={() => handleEditService(service.id)}
                            className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                          >
                            <Trash className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200 mb-2">
                          {service.category}
                        </span>
                        <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                        <p className="text-gray-700 text-sm mb-2 line-clamp-2">{service.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">
                            ₹{service.price}{service.priceType === 'hourly' ? '/hr' : ''}
                          </span>
                          <span className="text-sm text-gray-500">
                            {service.location.city}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {bookingsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-500">
                    You'll see booking requests from customers here once they start coming in.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingBookings.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="bg-yellow-50 px-4 py-2 border-b border-yellow-100">
                        <h3 className="font-medium text-yellow-800 flex items-center">
                          <Clock className="h-5 w-5 mr-2" />
                          Pending Requests ({pendingBookings.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {pendingBookings.map((booking) => (
                          <div key={booking.id} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{booking.description}</p>
                                <p className="text-sm text-gray-500">
                                  <Calendar className="h-4 w-4 inline mr-1" />
                                  {formatDate(booking.date)} at {booking.timeSlot}
                                </p>
                              </div>
                              <p className="font-bold">₹{booking.price}</p>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                className="btn btn-sm btn-outline-danger"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Decline
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                className="btn btn-sm btn-primary"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {confirmedBookings.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="bg-green-50 px-4 py-2 border-b border-green-100">
                        <h3 className="font-medium text-green-800 flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Confirmed Bookings ({confirmedBookings.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {confirmedBookings.map((booking) => (
                          <div key={booking.id} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{booking.description}</p>
                                <p className="text-sm text-gray-500">
                                  <Calendar className="h-4 w-4 inline mr-1" />
                                  {formatDate(booking.date)} at {booking.timeSlot}
                                </p>
                              </div>
                              <p className="font-bold">₹{booking.price}</p>
                            </div>
                            <div className="flex justify-end mt-4">
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                                className="btn btn-sm btn-success"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Completed
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {completedBookings.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
                        <h3 className="font-medium text-blue-800 flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Completed ({completedBookings.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {completedBookings.map((booking) => (
                          <div key={booking.id} className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{booking.description}</p>
                                <p className="text-sm text-gray-500">
                                  <Calendar className="h-4 w-4 inline mr-1" />
                                  {formatDate(booking.date)} at {booking.timeSlot}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Completed on {formatDate(booking.updatedAt)}
                                </p>
                              </div>
                              <p className="font-bold">₹{booking.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cancelledBookings.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                        <h3 className="font-medium text-gray-800 flex items-center">
                          <XCircle className="h-5 w-5 mr-2" />
                          Cancelled ({cancelledBookings.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {cancelledBookings.map((booking) => (
                          <div key={booking.id} className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{booking.description}</p>
                                <p className="text-sm text-gray-500">
                                  <Calendar className="h-4 w-4 inline mr-1" />
                                  {formatDate(booking.date)} at {booking.timeSlot}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Cancelled on {formatDate(booking.updatedAt)}
                                </p>
                              </div>
                              <p className="font-bold">₹{booking.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ServiceProviderDashboard;
