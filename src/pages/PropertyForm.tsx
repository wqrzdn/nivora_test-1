import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Info, MapPin, IndianRupee, Building, Tag, Check, Image, Users, Loader2 } from 'lucide-react';
import LocationPicker from '../components/maps/LocationPicker';
import { useAuth } from '../context/AuthContext';
import { useProperty } from '../context/PropertyContext';
import { uploadMultipleToCloudinary, getOptimizedImageUrl } from '../utils/cloudinaryUpload';

// Interface for parsed address from LocationPicker
interface ParsedAddress {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  lat: number;
  lng: number;
  streetAddress?: string;
}

interface PropertyFormProps {
  isEditing?: boolean;
  propertyData?: any;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ isEditing = false, propertyData = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addProperty, updateProperty, isLoading } = useProperty();

  const [formData, setFormData] = useState(
    isEditing && propertyData ? {
      title: propertyData.title || '',
      type: propertyData.type || 'apartment',
      address: propertyData.address || '',
      city: propertyData.city || '',
      state: propertyData.state || '',
      pincode: propertyData.pincode || '',
      rent: propertyData.rent ? propertyData.rent.toString() : '',
      deposit: propertyData.deposit ? propertyData.deposit.toString() : '',
      bedrooms: propertyData.bedrooms ? propertyData.bedrooms.toString() : '1',
      bathrooms: propertyData.bathrooms ? propertyData.bathrooms.toString() : '1',
      furnishing: propertyData.furnishing || 'unfurnished',
      isPetFriendly: propertyData.isPetFriendly || false,
      area: propertyData.area ? propertyData.area.toString() : '',
      description: propertyData.description || '',
      amenities: propertyData.amenities || [],
      images: propertyData.images || [],
      genderPreference: propertyData.genderPreference || 'any',
      accommodationType: propertyData.accommodationType || 'any',
      location: propertyData.location || {
        lat: 0,
        lng: 0,
        address: ''
      }
    } : {
      title: '',
      type: 'apartment',
      address: '',
      city: '',
      state: '',
      pincode: '',
      rent: '',
      deposit: '',
      bedrooms: '1',
      bathrooms: '1',
      furnishing: 'unfurnished',
      isPetFriendly: false,
      area: '',
      description: '',
      amenities: [] as string[],
      images: [] as string[],
      genderPreference: 'any',
      accommodationType: 'any',
      location: {
        lat: 0,
        lng: 0,
        address: ''
      }
    }
  );

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // List of amenities to choose from
  const amenityOptions = [
    'Air Conditioning',
    'Parking',
    'Swimming Pool',
    'Gym',
    'Power Backup',
    'Security',
    'Elevator',
    'Garden',
    'Balcony',
    'WiFi',
    'TV',
    'Refrigerator',
    'Washing Machine',
    'Modular Kitchen',
    '24x7 Water Supply'
  ];

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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Clear error
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => {
      const amenities = [...prev.amenities];
      if (amenities.includes(amenity)) {
        return {
          ...prev,
          amenities: amenities.filter(a => a !== amenity)
        };
      } else {
        return {
          ...prev,
          amenities: [...amenities, amenity]
        };
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      // Log for debugging
      console.log('Selected files:', selectedFiles.map(f => f.name));
      
      // Add new files to the imageFiles array
      setImageFiles(prev => [...prev, ...selectedFiles]);
      
      // Create preview URLs for immediate display
      const previewUrls = selectedFiles.map(file => URL.createObjectURL(file));
      console.log('Preview URLs created:', previewUrls);
      
      // Add new preview URLs to the images array
      setFormData(prev => {
        // Filter out any existing blob URLs that match the new files (to prevent duplicates)
        const existingBlobUrls = prev.images.filter((img: string) => 
          img && typeof img === 'string' && img.startsWith('blob:') && !previewUrls.includes(img)
        );
        
        // Filter out any Firebase Storage URLs
        const existingFirebaseUrls = prev.images.filter((img: string) => 
          img && typeof img === 'string' && 
          !img.startsWith('blob:') && 
          img.includes('firebasestorage.googleapis.com')
        );
        
        // Combine existing URLs with new preview URLs
        const updatedImages = [...existingBlobUrls, ...existingFirebaseUrls, ...previewUrls];
        console.log('Updated images array:', updatedImages);
        
        return {
          ...prev,
          images: updatedImages
        };
      });
      
      // Clear any image-related errors
      if (errors.images) {
        setErrors(prev => ({
          ...prev,
          images: ''
        }));
      }
    }
  };

  // handleLocationSelect is defined below

  const handleImageUpload = async () => {
    if (imageFiles.length === 0) {
      setErrors(prev => ({
        ...prev,
        images: 'Please select at least one image'
      }));
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('Uploading images to Cloudinary...');
      
      // Upload images to Cloudinary instead of Firebase Storage
      const uploadedUrls = await uploadMultipleToCloudinary(
        imageFiles,
        (progress) => setUploadProgress(progress)
      );
      
      console.log('Images uploaded successfully to Cloudinary, URLs:', uploadedUrls);
      
      // Update form data with the uploaded image URLs - APPEND to existing images
      // Filter out any temporary blob URLs and keep only valid image URLs
      const existingImages = formData.images.filter((img: string) => 
        img && typeof img === 'string' && 
        !img.startsWith('blob:') && 
        (img.includes('cloudinary.com') || img.includes('firebasestorage.googleapis.com'))
      );
      
      // Log for debugging
      console.log('Existing valid images:', existingImages);
      console.log('Newly uploaded images:', uploadedUrls);
      
      const updatedImages = [...existingImages, ...uploadedUrls];
      console.log('Updated images array:', updatedImages);
      
      setFormData(prev => ({
        ...prev,
        images: updatedImages
      }));
      
      // Clear the file input
      setImageFiles([]);
      setUploadProgress(0);
      
      // Clear any errors
      if (errors.images) {
        setErrors(prev => ({
          ...prev,
          images: ''
        }));
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setErrors(prev => ({
        ...prev,
        images: 'Failed to upload images. Please try again.'
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Property title is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (formData.pincode.length !== 6) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    
    if (formData.location.lat === 0 || formData.location.lng === 0) {
      newErrors.location = 'Please select a location on the map';
    }
    
    if (!formData.rent) {
      newErrors.rent = 'Rent amount is required';
    }
    
    if (!formData.area) {
      newErrors.area = 'Area is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    
    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    
    return newErrors;
  };

  const handleLocationSelect = (parsedAddress: ParsedAddress) => {
    // Update form data with all location fields in a single batched state update to prevent flickering
    setFormData(prev => {
      // Create a new state object with all updates at once
      return {
        ...prev,
        // Update location coordinates and address
        location: {
          lat: parsedAddress.lat,
          lng: parsedAddress.lng,
          address: parsedAddress.address
        },
        // Use the street address component if available, with fallbacks
        address: parsedAddress.streetAddress || parsedAddress.address.split(',')[0] || prev.address,
        // Use city with proper fallback
        city: parsedAddress.city || prev.city,
        // Use state with proper fallback
        state: parsedAddress.state || prev.state,
        // Use postal code with fallbacks
        pincode: parsedAddress.postalCode || (() => {
          // Fallback to regex extraction for pincode if not provided
          const pincodeMatch = parsedAddress.address.match(/\b\d{6}\b/);
          return pincodeMatch ? pincodeMatch[0] : prev.pincode;
        })()
      };
    });
    
    // Log warnings for missing fields (for dev debugging)
    if (!parsedAddress.city) {
      console.warn('LocationPicker: Missing city in parsed address');
    }
    if (!parsedAddress.state) {
      console.warn('LocationPicker: Missing state in parsed address');
    }
    if (!parsedAddress.postalCode) {
      console.warn('LocationPicker: Missing postal code in parsed address');
    }
    
    // Clear any location-related errors
    setErrors(prev => ({
      ...prev,
      location: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form before submission
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo(0, 0);
      return;
    }
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      // Make sure we're only using valid image URLs (not blob URLs or empty strings)
      const cleanedImages = formData.images
        .filter((img: string) => 
          img && 
          typeof img === 'string' && 
          !img.startsWith('blob:') && 
          (img.includes('cloudinary.com') || img.includes('firebasestorage.googleapis.com'))
        )
        // Optimize Cloudinary URLs for better performance
        .map((img: string) => {
          if (img.includes('cloudinary.com')) {
            return getOptimizedImageUrl(img, 1200, 90); // Higher quality for property listings
          }
          return img;
        });
      console.log('Cleaned and optimized images for storage:', cleanedImages);
      
      // Format the data for the API
      const formattedData = {
        ...formData,
        images: cleanedImages, // Use the cleaned images array
        ownerId: user.id,
        rent: parseInt(formData.rent),
        deposit: formData.deposit ? parseInt(formData.deposit) : 0,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area: parseInt(formData.area),
        status: isEditing ? (propertyData?.status || 'available') : 'available' as const,
        type: formData.type as 'apartment' | 'house' | 'commercial',
        furnishing: formData.furnishing as 'unfurnished' | 'semi-furnished' | 'fully-furnished',
        genderPreference: formData.genderPreference as 'male' | 'female' | 'any',
        accommodationType: formData.accommodationType as 'family' | 'bachelor' | 'pg' | 'any',
        location: formData.location.lat !== 0 && formData.location.lng !== 0 ? formData.location : undefined,
        createdAt: isEditing ? propertyData?.createdAt : new Date(),
        updatedAt: new Date(),
      };
      
      console.log('Submitting property with images:', formattedData.images);
      
      if (isEditing && propertyData?.id) {
        // Update existing property
        await updateProperty(propertyData.id, formattedData);
        navigate('/owner/properties');
      } else {
        // Add new property
        await addProperty(formattedData);
        navigate('/owner/properties');
      }
    } catch (error) {
      console.error('Error submitting property:', error);
      setErrors({
        submit: 'Failed to submit property. Please try again.',
      });
      window.scrollTo(0, 0);
    }

  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{isEditing ? 'Edit Your Property' : 'List Your Property'}</h1>
        <p className="text-gray-600">Provide details about your property to list it for rent</p>
      </div>
      
      {errors.submit && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        {/* Basic Details */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Home className="w-5 h-5 mr-2 text-primary-600" />
            Basic Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Property Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`input w-full ${errors.title ? 'border-red-500' : ''}`}
                placeholder="E.g., Modern 2BHK Apartment in Bandra"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type*
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="commercial">Commercial Space</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Location */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-primary-600" />
            Location
          </h2>
          <div className="space-y-4">
            {/* Google Maps Location Picker */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Location on Map*
              </label>
              <LocationPicker
                initialLocation={formData.location.lat !== 0 ? formData.location : undefined}
                onLocationSelect={handleLocationSelect}
                height="400px"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address*
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`input w-full ${errors.address ? 'border-red-500' : ''}`}
                placeholder="Street address"
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City*
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`input w-full ${errors.city ? 'border-red-500' : ''}`}
                  placeholder="City"
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State*
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`input w-full ${errors.state ? 'border-red-500' : ''}`}
                  placeholder="State"
                />
                {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
              </div>
              
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode*
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleNumberChange}
                  maxLength={6}
                  className={`input w-full ${errors.pincode ? 'border-red-500' : ''}`}
                  placeholder="6-digit Pincode"
                />
                {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>}
              </div>
            </div>
          </div>
        </div>
        
        {/* Pricing */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <IndianRupee className="w-5 h-5 mr-2 text-primary-600" />
            Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="rent" className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent (₹)*
              </label>
              <input
                type="text"
                id="rent"
                name="rent"
                value={formData.rent}
                onChange={handleNumberChange}
                className={`input w-full ${errors.rent ? 'border-red-500' : ''}`}
                placeholder="E.g., 25000"
              />
              {errors.rent && <p className="mt-1 text-sm text-red-600">{errors.rent}</p>}
            </div>
            
            <div>
              <label htmlFor="deposit" className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit (₹)
              </label>
              <input
                type="text"
                id="deposit"
                name="deposit"
                value={formData.deposit}
                onChange={handleNumberChange}
                className="input w-full"
                placeholder="E.g., 100000"
              />
            </div>
          </div>
        </div>
        
        {/* Property Features */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2 text-primary-600" />
            Property Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms*
              </label>
              <select
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="0">Studio</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4 Bedrooms</option>
                <option value="5">5+ Bedrooms</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms*
              </label>
              <select
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="1">1 Bathroom</option>
                <option value="2">2 Bathrooms</option>
                <option value="3">3 Bathrooms</option>
                <option value="4">4+ Bathrooms</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                Area (sq. ft.)*
              </label>
              <input
                type="text"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleNumberChange}
                className={`input w-full ${errors.area ? 'border-red-500' : ''}`}
                placeholder="E.g., 1200"
              />
              {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
            </div>
            
            <div>
              <label htmlFor="furnishing" className="block text-sm font-medium text-gray-700 mb-1">
                Furnishing Status*
              </label>
              <select
                id="furnishing"
                name="furnishing"
                value={formData.furnishing}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="unfurnished">Unfurnished</option>
                <option value="semi-furnished">Semi-Furnished</option>
                <option value="fully-furnished">Fully Furnished</option>
              </select>
            </div>
            
            <div className="flex items-center h-full pt-6">
              <input
                type="checkbox"
                id="isPetFriendly"
                name="isPetFriendly"
                checked={formData.isPetFriendly}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <label htmlFor="isPetFriendly" className="ml-2 block text-sm text-gray-700">
                Pet Friendly
              </label>
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-4 flex items-center mt-4">
            <Users className="w-5 h-5 mr-2 text-primary-600" />
            Tenant Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="genderPreference" className="block text-sm font-medium text-gray-700 mb-1">
                Gender Preference
              </label>
              <select
                id="genderPreference"
                name="genderPreference"
                value={formData.genderPreference}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="any">Any</option>
                <option value="male">Male Only</option>
                <option value="female">Female Only</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Specify if you have a gender preference for tenants</p>
            </div>
            
            <div>
              <label htmlFor="accommodationType" className="block text-sm font-medium text-gray-700 mb-1">
                Accommodation Type
              </label>
              <select
                id="accommodationType"
                name="accommodationType"
                value={formData.accommodationType}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="any">Any</option>
                <option value="family">Family Only</option>
                <option value="bachelor">Bachelor Only</option>
                <option value="pg">PG / Hostel</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Specify the type of accommodation you're offering</p>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-primary-600" />
            Description
          </h2>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Property Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={`input w-full ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Describe your property in detail. Include information about the neighborhood, proximity to public transport, schools, etc."
            ></textarea>
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.length}/500 characters (minimum 50)
            </p>
          </div>
        </div>
        
        {/* Amenities */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Tag className="w-5 h-5 mr-2 text-primary-600" />
            Amenities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {amenityOptions.map(amenity => (
              <div key={amenity} className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`flex items-center px-3 py-2 rounded-md border ${
                    formData.amenities.includes(amenity)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {formData.amenities.includes(amenity) && (
                    <Check className="h-4 w-4 mr-2 text-primary-600" />
                  )}
                  <span className="text-sm">{amenity}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Images */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Image className="w-5 h-5 mr-2 text-primary-600" />
            Images
          </h2>
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div>
                {formData.images.length > 0 && (
                  <div className="mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {formData.images.map((image: string, index: number) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden h-32">
                          <img 
                            src={image} 
                            alt={`Property image ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_: string, i: number) => i !== index)
                                }));
                              }}
                              className="p-1 bg-red-500 text-white rounded-full"
                              aria-label="Remove image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <input
                      type="file"
                      id="property-images"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="property-images"
                      className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer inline-block text-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {formData.images.length > 0 ? 'Add More Images' : 'Select Images'}
                    </label>
                    
                    {imageFiles.length > 0 && (
                      <button
                        type="button"
                        onClick={handleImageUpload}
                        disabled={isUploading}
                        className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Uploading... {Math.round(uploadProgress)}%
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                            </svg>
                            Upload {imageFiles.length} Image{imageFiles.length !== 1 ? 's' : ''}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {imageFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        {imageFiles.length} new file{imageFiles.length !== 1 ? 's' : ''} selected for upload
                      </p>
                      <ul className="text-xs text-gray-500 mt-1 text-left">
                        {imageFiles.slice(0, 3).map((file, index) => (
                          <li key={index}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
                        ))}
                        {imageFiles.length > 3 && <li>...and {imageFiles.length - 3} more</li>}
                      </ul>
                    </div>
                  )}
                </div>
                
                <p className="mt-4 text-sm text-gray-500">
                  JPG, PNG or GIF, up to 5MB each. Add at least one image.
                </p>
                {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary px-6 py-3"
          >
            {isLoading ? 'Submitting...' : isEditing ? 'Update Property' : 'List Property'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm; 