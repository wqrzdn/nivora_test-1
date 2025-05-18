import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Home, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, isAuthenticated } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);
  
  const [userType, setUserType] = useState<'owner' | 'tenant' | 'service-provider' | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    serviceCategory: '',
    serviceAreas: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateStep1 = () => {
    if (!userType) {
      setErrors({ userType: 'Please select a user type' });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate service provider specific fields
    if (userType === 'service-provider') {
      if (!formData.serviceCategory) {
        newErrors.serviceCategory = 'Service category is required';
      }
      
      if (!formData.serviceAreas) {
        newErrors.serviceAreas = 'Service areas are required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      handleNextStep();
      return;
    }
    
    if (!validateStep2()) return;
    
    setIsLoading(true);
    
    try {
      if (!userType) throw new Error('User type not selected');
      
      // Process service areas if service provider
      let processedData: any = { ...formData };
      if (userType === 'service-provider' && formData.serviceAreas) {
        processedData.serviceAreas = formData.serviceAreas.split(',').map(area => area.trim());
      }
      
      console.log('Registering user with data:', { ...processedData, userType });
      
      await registerUser({
        ...processedData,
        userType,
      });
      
      console.log('Registration successful!');
      
      // No need to manually navigate - the useEffect hook will handle redirection
      // based on the isAuthenticated state
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrors({
        form: error.message || 'Registration failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your account
            </Link>
          </p>
        </div>
        
        {errors.form && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{errors.form}</p>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">I want to:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-colors ${
                    userType === 'owner'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setUserType('owner')}
                >
                  <Home className={`h-10 w-10 mb-2 ${userType === 'owner' ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className="font-medium">List my property</span>
                  <span className="text-sm text-gray-500 mt-1">I'm a property owner</span>
                  {userType === 'owner' && (
                    <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-primary-600" />
                  )}
                </button>
                
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-colors ${
                    userType === 'tenant'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setUserType('tenant')}
                >
                  <Users className={`h-10 w-10 mb-2 ${userType === 'tenant' ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className="font-medium">Find a home/roommate</span>
                  <span className="text-sm text-gray-500 mt-1">I'm looking for a place</span>
                  {userType === 'tenant' && (
                    <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-primary-600" />
                  )}
                </button>

                <button
                  type="button"
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-colors ${
                    userType === 'service-provider'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setUserType('service-provider')}
                >
                  <User className={`h-10 w-10 mb-2 ${userType === 'service-provider' ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className="font-medium">Offer services</span>
                  <span className="text-sm text-gray-500 mt-1">I'm a service provider</span>
                  {userType === 'service-provider' && (
                    <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-primary-600" />
                  )}
                </button>
              </div>
              
              {errors.userType && (
                <p className="mt-1 text-sm text-red-600">{errors.userType}</p>
              )}
              
              <div>
                <button
                  type="submit"
                  className="btn btn-primary w-full py-3 mt-6"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`input ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`input ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-outline"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register; 