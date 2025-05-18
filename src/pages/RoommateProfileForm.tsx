import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoommate, RoommateProfile } from '../context/RoommateContext';
import { useAuth } from '../context/AuthContext';
import { uploadFile } from '../utils/fileUpload';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ArrowLeft, Upload, X } from 'lucide-react';

const RoommateProfileForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userProfile, createProfile, updateProfile, isLoading } = useRoommate();
  
  const [formData, setFormData] = useState<Partial<RoommateProfile> & { budget: { min: number; max: number; }; lifestyle: { smoking: boolean; pets: boolean; drinking: boolean; foodPreference: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'no-preference'; workSchedule: 'day' | 'night' | 'flexible'; cleanliness: 'very-clean' | 'clean' | 'moderate' | 'relaxed'; } }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatarUrl: '',
    budget: {
      min: 0,
      max: 0
    },
    preferredLocations: [''],
    lifestyle: {
      smoking: false,
      pets: false,
      drinking: false,
      foodPreference: 'no-preference' as 'no-preference',
      workSchedule: 'flexible' as 'flexible',
      cleanliness: 'moderate' as 'moderate'
    },
    bio: '',
    lookingFor: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Load existing profile data if in edit mode
  useEffect(() => {
    if (isEdit && userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        avatarUrl: userProfile.avatarUrl || '',
        budget: {
          min: userProfile.budget.min || 0,
          max: userProfile.budget.max || 0
        },
        preferredLocations: userProfile.preferredLocations.length > 0 
          ? userProfile.preferredLocations 
          : [''],
        lifestyle: {
          smoking: userProfile.lifestyle.smoking || false,
          pets: userProfile.lifestyle.pets || false,
          drinking: userProfile.lifestyle.drinking || false,
          foodPreference: userProfile.lifestyle.foodPreference || 'no-preference',
          workSchedule: userProfile.lifestyle.workSchedule || 'flexible',
          cleanliness: userProfile.lifestyle.cleanliness || 'moderate'
        },
        bio: userProfile.bio || '',
        lookingFor: userProfile.lookingFor || ''
      });
      
      if (userProfile.avatarUrl) {
        setAvatarPreview(userProfile.avatarUrl);
      }
    } else if (user) {
      // Pre-fill with user data if creating new profile
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || ''
      }));
      
      if (user.avatarUrl) {
        setAvatarPreview(user.avatarUrl);
      }
    }
  }, [isEdit, userProfile, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'lifestyle' && (child === 'foodPreference' || child === 'workSchedule' || child === 'cleanliness')) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent] || {}),
            [child]: value as any
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value === '' ? 0 : parseInt(value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseInt(value)
      }));
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };

  const handleLocationChange = (index: number, value: string) => {
    const updatedLocations = formData.preferredLocations ? [...formData.preferredLocations] : [''];
    updatedLocations[index] = value;
    
    setFormData(prev => ({
      ...prev,
      preferredLocations: updatedLocations
    }));
  };

  const addLocationField = () => {
    setFormData(prev => ({
      ...prev,
      preferredLocations: prev.preferredLocations ? [...prev.preferredLocations, ''] : ['']
    }));
  };

  const removeLocationField = (index: number) => {
    if (formData.preferredLocations && formData.preferredLocations.length > 1) {
      const updatedLocations = [...formData.preferredLocations];
      updatedLocations.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        preferredLocations: updatedLocations
      }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setFormData(prev => ({
      ...prev,
      avatarUrl: ''
    }));
  };

  const uploadAvatar = async (): Promise<string> => {
    if (!avatarFile) return formData.avatarUrl || '';
    
    setIsUploading(true);
    try {
      const avatarUrl = await uploadFile(
        avatarFile,
        `roommate-profiles/${user?.id}`,
        (progress) => setUploadProgress(progress)
      );
      
      setIsUploading(false);
      return avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setIsUploading(false);
      throw new Error('Failed to upload avatar');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Budget validation
    if (!formData.budget?.min && formData.budget?.min !== 0) {
      newErrors['budget.min'] = 'Minimum budget is required';
    } else if (formData.budget?.min < 0) {
      newErrors['budget.min'] = 'Minimum budget must be greater than or equal to 0';
    }
    
    if (!formData.budget?.max && formData.budget?.max !== 0) {
      newErrors['budget.max'] = 'Maximum budget is required';
    } else if (formData.budget?.max <= 0) {
      newErrors['budget.max'] = 'Maximum budget must be greater than 0';
    }
    
    if (formData.budget?.min > formData.budget?.max) {
      newErrors['budget.max'] = 'Maximum budget must be greater than minimum budget';
    }
    
    // Locations validation
    if (formData.preferredLocations?.some(loc => !loc.trim())) {
      newErrors['preferredLocations'] = 'All location fields must be filled';
    }
    
    // Bio validation
    if (!formData.bio?.trim()) {
      newErrors['bio'] = 'Bio is required';
    } else if (formData.bio && formData.bio.length < 20) {
      newErrors['bio'] = 'Bio should be at least 20 characters';
    }
    
    // Looking for validation
    if (!formData.lookingFor?.trim()) {
      newErrors['lookingFor'] = 'Please describe what you are looking for';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      // Upload avatar if changed
      let avatarUrl = formData.avatarUrl;
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }
      
      const profileData: Partial<RoommateProfile> = {
        ...formData,
        avatarUrl,
        preferredLocations: formData.preferredLocations?.filter(loc => loc.trim()) || []
      };
      
      if (isEdit) {
        await updateProfile(profileData);
      } else {
        await createProfile(profileData);
      }
      
      navigate('/roommates');
    } catch (error: any) {
      console.error('Profile submission error:', error);
      setErrors({
        form: error.message || 'Failed to save profile. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button 
        onClick={() => navigate('/roommates')}
        className="flex items-center text-primary-600 hover:text-primary-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Roommates
      </button>
      
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? 'Edit Your Roommate Profile' : 'Create Roommate Profile'}
      </h1>
      
      {errors.form && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700">{errors.form}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          
          {/* Avatar Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-6">
              <div className="relative">
                {avatarPreview ? (
                  <div className="relative">
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="text-white text-sm">{Math.round(uploadProgress)}%</div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="btn btn-outline-primary cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {avatarPreview ? 'Change Picture' : 'Upload Picture'}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: Square image, at least 300x300 pixels
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input w-full"
                disabled={true} // Use user's name from auth
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input w-full"
                disabled={true} // Use user's name from auth
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input w-full"
                disabled={true} // Use user's email from auth
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input w-full"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        </div>
        
        {/* Budget Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Budget</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget.min" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Budget (₹)
              </label>
              <input
                type="number"
                id="budget.min"
                name="budget.min"
                value={formData.budget.min}
                onChange={handleNumberChange}
                className={`input w-full ${errors['budget.min'] ? 'border-red-500' : ''}`}
                min="0"
              />
              {errors['budget.min'] && (
                <p className="mt-1 text-sm text-red-600">{errors['budget.min']}</p>
              )}
            </div>
            <div>
              <label htmlFor="budget.max" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Budget (₹)
              </label>
              <input
                type="number"
                id="budget.max"
                name="budget.max"
                value={formData.budget.max}
                onChange={handleNumberChange}
                className={`input w-full ${errors['budget.max'] ? 'border-red-500' : ''}`}
                min="0"
              />
              {errors['budget.max'] && (
                <p className="mt-1 text-sm text-red-600">{errors['budget.max']}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Preferred Locations */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Preferred Locations</h2>
          {(formData.preferredLocations || ['']).map((location, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={location}
                onChange={(e) => handleLocationChange(index, e.target.value)}
                className={`input flex-grow ${errors['preferredLocations'] ? 'border-red-500' : ''}`}
                placeholder="Enter area, locality or city"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeLocationField(index)}
                  className="ml-2 p-2 text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {errors['preferredLocations'] && (
            <p className="mt-1 text-sm text-red-600 mb-2">{errors['preferredLocations']}</p>
          )}
          <button
            type="button"
            onClick={addLocationField}
            className="btn btn-outline-primary mt-2"
          >
            Add Another Location
          </button>
        </div>
        
        {/* Lifestyle Preferences */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Lifestyle Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="lifestyle.smoking"
                  name="lifestyle.smoking"
                  checked={formData.lifestyle.smoking}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="lifestyle.smoking" className="ml-2 block text-sm text-gray-900">
                  Smoking Friendly
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="lifestyle.pets"
                  name="lifestyle.pets"
                  checked={formData.lifestyle.pets}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="lifestyle.pets" className="ml-2 block text-sm text-gray-900">
                  Pet Friendly
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="lifestyle.drinking"
                  name="lifestyle.drinking"
                  checked={formData.lifestyle.drinking}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="lifestyle.drinking" className="ml-2 block text-sm text-gray-900">
                  Drinking Friendly
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="lifestyle.foodPreference" className="block text-sm font-medium text-gray-700 mb-1">
                  Food Preference
                </label>
                <select
                  id="lifestyle.foodPreference"
                  name="lifestyle.foodPreference"
                  value={formData.lifestyle.foodPreference}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="no-preference">No Preference</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="lifestyle.workSchedule" className="block text-sm font-medium text-gray-700 mb-1">
                  Work Schedule
                </label>
                <select
                  id="lifestyle.workSchedule"
                  name="lifestyle.workSchedule"
                  value={formData.lifestyle.workSchedule}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="day">Day Shift</option>
                  <option value="night">Night Shift</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="lifestyle.cleanliness" className="block text-sm font-medium text-gray-700 mb-1">
                  Cleanliness Level
                </label>
                <select
                  id="lifestyle.cleanliness"
                  name="lifestyle.cleanliness"
                  value={formData.lifestyle.cleanliness}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="very-clean">Very Clean</option>
                  <option value="clean">Clean</option>
                  <option value="moderate">Moderate</option>
                  <option value="relaxed">Relaxed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bio & Looking For */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className={`input w-full ${errors.bio ? 'border-red-500' : ''}`}
              placeholder="Tell potential roommates about yourself..."
            ></textarea>
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="lookingFor" className="block text-sm font-medium text-gray-700 mb-1">
              What are you looking for in a roommate?
            </label>
            <textarea
              id="lookingFor"
              name="lookingFor"
              value={formData.lookingFor}
              onChange={handleChange}
              rows={4}
              className={`input w-full ${errors.lookingFor ? 'border-red-500' : ''}`}
              placeholder="Describe your ideal roommate..."
            ></textarea>
            {errors.lookingFor && (
              <p className="mt-1 text-sm text-red-600">{errors.lookingFor}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/roommates')}
            className="btn btn-outline-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || isUploading}
            className="btn btn-primary"
          >
            {submitting ? 'Saving...' : isEdit ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoommateProfileForm;
