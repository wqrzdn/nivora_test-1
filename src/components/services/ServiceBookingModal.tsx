import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useService } from '../../context/ServiceContext';
import { useServiceBooking } from '../../context/ServiceBookingContext';
import { useProperty } from '../../context/PropertyContext';

interface ServiceBookingModalProps {
  serviceId: string;
  onClose: () => void;
}

const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({ serviceId, onClose }) => {
  const { user } = useAuth();
  const { getServiceById } = useService();
  const { createBooking } = useServiceBooking();
  const { properties, getPropertiesByOwner } = useProperty();
  
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    description: '',
    propertyId: '',
  });

  // Get available time slots based on service availability
  const getTimeSlots = () => {
    if (!service) return [];
    
    const { startTime, endTime } = service.availability;
    const slots = [];
    
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    
    for (let hour = start; hour < end; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      slots.push(`${formattedHour}:00 - ${formattedHour}:30`);
      slots.push(`${formattedHour}:30 - ${(hour + 1).toString().padStart(2, '0')}:00`);
    }
    
    return slots;
  };

  // Get user's properties if they are an owner
  const userProperties = user?.userType === 'owner' ? getPropertiesByOwner(user.id) : [];

  // Load service details
  useEffect(() => {
    const loadService = async () => {
      try {
        const serviceData = await getServiceById(serviceId);
        if (serviceData) {
          setService(serviceData);
        } else {
          setError('Service not found');
        }
      } catch (err) {
        setError('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [serviceId, getServiceById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !service) return;
    
    // Validate form
    if (!formData.date) {
      setError('Please select a date');
      return;
    }
    
    if (!formData.timeSlot) {
      setError('Please select a time slot');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Please provide a brief description of what you need');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Prepare booking data
      const bookingData = {
        serviceId: service.id,
        providerId: service.providerId,
        userId: user.id,
        propertyId: formData.propertyId || undefined,
        status: 'pending' as const,
        date: new Date(formData.date),
        timeSlot: formData.timeSlot,
        description: formData.description,
        price: service.price,
        // If tenant is booking for a property, include owner ID for notification
        ownerId: user.userType === 'tenant' && formData.propertyId 
          ? properties.find(p => p.id === formData.propertyId)?.ownerId 
          : undefined,
      };
      
      await createBooking(bookingData);
      setSuccess(true);
      
      // Reset form
      setFormData({
        date: '',
        timeSlot: '',
        description: '',
        propertyId: '',
      });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Check if selected date is an available day
  const isDateAvailable = (dateString: string) => {
    if (!service || !dateString) return true;
    
    const date = new Date(dateString);
    const dayIndex = date.getDay();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[dayIndex];
    
    return service.availability.days.includes(dayName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Book Service</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <p>Loading service details...</p>
          </div>
        ) : error && !service ? (
          <div className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        ) : success ? (
          <div className="p-6 text-center">
            <div className="mb-4 text-green-600">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Successful!</h3>
            <p className="text-gray-500">
              Your booking request has been sent to the service provider.
              You'll be notified once they confirm.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {service && (
              <div className="mb-4">
                <h3 className="font-medium text-lg">{service.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{service.location.city}</span>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Price: </span>
                  <span>₹{service.price}{service.priceType === 'hourly' ? '/hr' : ''}</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Select Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                min={getMinDate()}
                value={formData.date}
                onChange={handleChange}
                className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
              {formData.date && !isDateAvailable(formData.date) && (
                <p className="mt-1 text-sm text-red-600">
                  Service is not available on this day. Available days: {service?.availability.days.join(', ')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Select Time Slot
              </label>
              <select
                id="timeSlot"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
                disabled={!formData.date || !isDateAvailable(formData.date)}
              >
                <option value="">Select a time slot</option>
                {getTimeSlots().map(slot => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
            
            {(user?.userType === 'owner' || user?.userType === 'tenant') && (
              <div>
                <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700 mb-1">
                  <Home className="h-4 w-4 inline mr-1" />
                  {user.userType === 'owner' ? 'Select Your Property' : 'Select Property'}
                  <span className="text-gray-500 text-xs ml-1">(Optional)</span>
                </label>
                <select
                  id="propertyId"
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">No specific property</option>
                  {userProperties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.address}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description of Service Needed
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Please describe what you need help with..."
                className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !isDateAvailable(formData.date)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Booking...' : 'Book Service'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ServiceBookingModal;
