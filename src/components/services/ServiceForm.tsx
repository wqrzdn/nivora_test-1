import React, { useState, useEffect } from 'react';
import { X, Plus, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useService, Service } from '../../context/ServiceContext';

interface ServiceFormProps {
  serviceId?: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ serviceId, onCancel, onSuccess }) => {
  const { user } = useAuth();
  const { 
    addService, 
    updateService, 
    getServiceById, 
    uploadServiceImage, 
    isLoading 
  } = useService();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    priceType: 'hourly',
    availableDays: [] as string[],
    startTime: '09:00',
    endTime: '18:00',
    city: '',
    areas: '',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const categories = [
    'electrician',
    'plumber',
    'painter',
    'carpenter',
    'cleaner',
    'gardener',
    'other'
  ];

  // Load service data if editing
  useEffect(() => {
    const loadService = async () => {
      if (serviceId) {
        try {
          const service = await getServiceById(serviceId);
          if (service) {
            setFormData({
              title: service.title,
              category: service.category,
              description: service.description,
              price: service.price.toString(),
              priceType: service.priceType,
              availableDays: service.availability.days,
              startTime: service.availability.startTime,
              endTime: service.availability.endTime,
              city: service.location.city,
              areas: service.location.areas.join(', '),
            });
            setImageUrls(service.images);
          }
        } catch (error) {
          console.error('Error loading service:', error);
        }
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

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => {
      const availableDays = [...prev.availableDays];
      if (availableDays.includes(day)) {
        return {
          ...prev,
          availableDays: availableDays.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          availableDays: [...availableDays, day]
        };
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...selectedFiles]);
      
      // Create preview URLs
      const newImageUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...newImageUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (formData.availableDays.length === 0) {
      newErrors.availableDays = 'Select at least one available day';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.areas.trim()) {
      newErrors.areas = 'Service areas are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Upload images if there are any new ones
      let uploadedImageUrls: string[] = [...imageUrls];
      
      if (images.length > 0) {
        setImageUploading(true);
        const uploadPromises = images.map(image => uploadServiceImage(image));
        const newImageUrls = await Promise.all(uploadPromises);
        uploadedImageUrls = [...uploadedImageUrls, ...newImageUrls];
        setImageUploading(false);
      }
      
      // Prepare service data
      const serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'> = {
        providerId: user.id,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        price: Number(formData.price),
        priceType: formData.priceType as 'hourly' | 'fixed',
        availability: {
          days: formData.availableDays,
          startTime: formData.startTime,
          endTime: formData.endTime,
        },
        location: {
          city: formData.city,
          areas: formData.areas.split(',').map(area => area.trim()),
        },
        images: uploadedImageUrls,
        rating: 0,
        reviewCount: 0,
      };
      
      if (serviceId) {
        await updateService(serviceId, serviceData);
      } else {
        await addService(serviceData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving service:', error);
      setErrors({
        form: 'Failed to save service. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{errors.form}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Service Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            } shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.category ? 'border-red-300' : 'border-gray-300'
            } shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500`}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.description ? 'border-red-300' : 'border-gray-300'
          } shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price *
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
              ₹
            </span>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`block w-full flex-1 rounded-none rounded-r-md border ${
                errors.price ? 'border-red-300' : 'border-gray-300'
              } p-2 focus:border-primary-500 focus:ring-primary-500`}
            />
          </div>
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>
        
        <div>
          <label htmlFor="priceType" className="block text-sm font-medium text-gray-700">
            Price Type
          </label>
          <select
            id="priceType"
            name="priceType"
            value={formData.priceType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="hourly">Hourly Rate</option>
            <option value="fixed">Fixed Price</option>
          </select>
        </div>
      </div>
      
      <div>
        <span className="block text-sm font-medium text-gray-700 mb-2">
          Available Days *
        </span>
        <div className="flex flex-wrap gap-2">
          {days.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(day)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                formData.availableDays.includes(day)
                  ? 'bg-primary-100 text-primary-800 border-primary-300'
                  : 'bg-gray-100 text-gray-800 border-gray-300'
              } border`}
            >
              {day}
            </button>
          ))}
        </div>
        {errors.availableDays && (
          <p className="mt-1 text-sm text-red-600">{errors.availableDays}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.city ? 'border-red-300' : 'border-gray-300'
            } shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500`}
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
        </div>
        
        <div>
          <label htmlFor="areas" className="block text-sm font-medium text-gray-700">
            Service Areas * (comma separated)
          </label>
          <input
            type="text"
            id="areas"
            name="areas"
            value={formData.areas}
            onChange={handleChange}
            placeholder="e.g. Downtown, North Side, West End"
            className={`mt-1 block w-full rounded-md border ${
              errors.areas ? 'border-red-300' : 'border-gray-300'
            } shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500`}
          />
          {errors.areas && <p className="mt-1 text-sm text-red-600">{errors.areas}</p>}
        </div>
      </div>
      
      <div>
        <span className="block text-sm font-medium text-gray-700 mb-2">
          Service Images
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative h-24 bg-gray-100 rounded-md overflow-hidden">
              <img
                src={url}
                alt={`Service ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          ))}
          <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="h-8 w-8 text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">Add Image</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
          disabled={isSubmitting || imageUploading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || imageUploading}
        >
          {isSubmitting || imageUploading
            ? 'Saving...'
            : serviceId
            ? 'Update Service'
            : 'Create Service'}
        </button>
      </div>
    </form>
  );
};

export default ServiceForm;
