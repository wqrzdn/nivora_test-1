import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, DollarSign, Calendar, Home, BedDouble, Bath, Wifi, Tv, Car, Thermometer, Utensils, Activity, Users, CheckCircle, Heart, Share, MessageSquare } from 'lucide-react';
import { useProperty } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import OwnerProfileCard from '../components/profile/OwnerProfileCard';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPropertyById, isLoading } = useProperty();
  const { user } = useAuth();
  
  const [property, setProperty] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [loadingProperty, setLoadingProperty] = useState(true);

  useEffect(() => {
    // Helper function to process property data
    const processPropertyData = (propertyData: any) => {
      // Debug property data
      console.log('Processing property data:', JSON.stringify(propertyData, null, 2));
      
      setProperty(propertyData);
      
      // Filter out any invalid image URLs and ensure we only use Firebase Storage URLs
      if (propertyData.images && Array.isArray(propertyData.images)) {
        const validImages = propertyData.images.filter(
          (img: string) => img && typeof img === 'string' && img.includes('firebasestorage.googleapis.com')
        );
        
        console.log('Valid images after filtering:', validImages);
        
        // Update property with valid images only
        setProperty({
          ...propertyData,
          images: validImages
        });
        
        // Set main image if we have valid images
        if (validImages.length > 0) {
          setMainImage(validImages[0]);
        }
      }
      
      setLoadingProperty(false);
    };
    
    const fetchProperty = async () => {
      if (!id) {
        navigate('/properties');
        return;
      }

      try {
        console.log('Fetching property with ID:', id);
        setLoadingProperty(true);
        
        // Try to get property from context first
        try {
          const propertyData = await getPropertyById(id);
          console.log('Property data received from context:', propertyData);
          
          if (propertyData) {
            processPropertyData(propertyData);
            return;
          } else {
            console.warn('Property not found via context method, trying direct Firestore fetch');
          }
        } catch (contextError) {
          console.error('Error fetching via context method:', contextError);
        }
        
        // If we're still here, the context method failed - try direct Firestore fetch
        console.log('Attempting direct Firestore fetch for property:', id);
        
        const propertyDoc = await getDoc(doc(db, 'properties', id));
        
        if (!propertyDoc.exists()) {
          console.error('Property document does not exist in Firestore');
          setLoadingProperty(false);
          return;
        }
        
        const data = propertyDoc.data();
        console.log('Raw property data from direct Firestore fetch:', data);
        
        // Process the data from Firestore
        const propertyData = {
          id: propertyDoc.id,
          ownerId: data.ownerId,
          title: data.title,
          type: data.type || 'apartment',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          rent: data.rent || 0,
          deposit: data.deposit || 0,
          bedrooms: data.bedrooms || 1,
          bathrooms: data.bathrooms || 1,
          furnishing: data.furnishing || 'unfurnished',
          isPetFriendly: data.isPetFriendly || false,
          area: data.area || 0,
          description: data.description || '',
          amenities: data.amenities || [],
          images: data.images || [],
          status: data.status || 'available',
          genderPreference: data.genderPreference || 'any',
          accommodationType: data.accommodationType || 'any',
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : new Date(),
        };
        
        processPropertyData(propertyData);
      } catch (error) {
        console.error('Error fetching property:', error);
        setLoadingProperty(false);
      }
    };

    fetchProperty();
  }, [id, getPropertyById, navigate]);

  const handleImageClick = (image: string) => {
    setMainImage(image);
  };

  const toggleContactForm = () => {
    setIsContactFormOpen(!isContactFormOpen);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      // Redirect to login if user is not authenticated
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    
    try {
      // In a real app, this would send a message to the owner
      console.log('Sending message to owner:', contactMessage, 'from user:', user.id, 'to owner:', property.ownerId);
      
      // Here you would typically save the message to Firestore
      // For example:
      // await addDoc(collection(db, 'messages'), {
      //   senderId: user.id,
      //   recipientId: property.ownerId,
      //   content: contactMessage,
      //   propertyId: property.id,
      //   createdAt: new Date(),
      //   read: false
      // });
      
      alert('Message sent successfully!');
      setContactMessage('');
      setIsContactFormOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  // Show loading spinner while fetching property data
  if (loadingProperty || isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error message if property not found or error occurred
  if (!property && !loadingProperty) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col p-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Property Not Found</h2>
        <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
        <p className="text-sm text-gray-500 mb-4">Debug info: Property ID: {id}</p>
        <Link to="/properties" className="btn btn-primary">
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Back navigation */}
      <div className="container mx-auto px-4 md:px-6 py-4">
        <Link to="/properties" className="inline-flex items-center text-gray-600 hover:text-primary-600 transition">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Link>
      </div>

      {/* Image Gallery */}
      <div className="container mx-auto px-4 md:px-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="rounded-lg overflow-hidden bg-gray-200 h-[300px] md:h-[400px]">
              {mainImage ? (
                <img 
                  src={mainImage} 
                  alt={property.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load image:', mainImage);
                    e.currentTarget.src = 'https://via.placeholder.com/800x600?text=No+Image+Available';
                  }}
                  onLoad={() => console.log('Successfully loaded main image:', mainImage)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 md:gap-4">
            {property.images && property.images.slice(0, 4).map((image: string, index: number) => (
              <div 
                key={index} 
                className={`rounded-lg overflow-hidden bg-gray-200 cursor-pointer h-[100px] sm:h-[140px] md:h-[190px] ${
                  mainImage === image ? 'ring-2 ring-primary-500' : ''
                }`}
                onClick={() => handleImageClick(image)}
              >
                <img 
                  src={image} 
                  alt={`Property view ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load thumbnail image:', image);
                    e.currentTarget.src = 'https://via.placeholder.com/200x200?text=No+Image';
                  }}
                  onLoad={() => console.log('Successfully loaded thumbnail image:', image)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Property Content */}
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title and basic details */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{property.address}, {property.city}, {property.state}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200" aria-label="Save property">
                    <Heart className="w-5 h-5 text-gray-700" />
                  </button>
                  <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200" aria-label="Share property">
                    <Share className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-4 mb-4">
                <div className="flex items-center bg-primary-50 text-primary-800 px-3 py-1 rounded-full">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="font-medium">₹{property.rent}/month</span>
                </div>
                <div className="flex items-center bg-primary-50 text-primary-800 px-3 py-1 rounded-full">
                  <Home className="w-4 h-4 mr-1" />
                  <span className="font-medium">{property.type}</span>
                </div>
                <div className="flex items-center bg-primary-50 text-primary-800 px-3 py-1 rounded-full">
                  <BedDouble className="w-4 h-4 mr-1" />
                  <span className="font-medium">{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center bg-primary-50 text-primary-800 px-3 py-1 rounded-full">
                  <Bath className="w-4 h-4 mr-1" />
                  <span className="font-medium">{property.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center bg-primary-50 text-primary-800 px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="font-medium">Available: {new Date(property.createdAt).toLocaleDateString()}</span>
                </div>
                {property.accommodationType && (
                  <div className="flex items-center bg-green-50 text-green-800 px-3 py-1 rounded-full">
                    <Users className="w-4 h-4 mr-1" />
                    <span className="font-medium">{property.accommodationType} Accommodation</span>
                  </div>
                )}
                {property.genderPreference && property.genderPreference !== 'any' && (
                  <div className="flex items-center bg-blue-50 text-blue-800 px-3 py-1 rounded-full">
                    <Users className="w-4 h-4 mr-1" />
                    <span className="font-medium">{property.genderPreference.charAt(0).toUpperCase() + property.genderPreference.slice(1)} Preferred</span>
                  </div>
                )}
              </div>
              <p className="text-gray-700">{property.description}</p>
            </div>

            {/* Property Details */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between px-4 py-2 bg-gray-100 rounded">
                    <span className="text-gray-600">Property Type</span>
                    <span className="font-medium">{property.type}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2 bg-gray-100 rounded">
                    <span className="text-gray-600">Area</span>
                    <span className="font-medium">{property.area} sq. ft.</span>
                  </div>
                  <div className="flex justify-between px-4 py-2 bg-gray-100 rounded">
                    <span className="text-gray-600">Furnished Status</span>
                    <span className="font-medium">{property.furnishing}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2 bg-gray-100 rounded">
                    <span className="text-gray-600">Facing</span>
                    <span className="font-medium">{property.facing}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between px-4 py-2 bg-gray-100 rounded">
                    <span className="text-gray-600">City</span>
                    <span className="font-medium">{property.city}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2 bg-gray-100 rounded">
                    <span className="text-gray-600">State</span>
                    <span className="font-medium">{property.state}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2 bg-gray-100 rounded">
                    <span className="text-gray-600">Pincode</span>
                    <span className="font-medium">{property.pincode}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2 bg-gray-100 rounded">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium capitalize">{property.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {property.amenities && property.amenities.map((amenity: string, index: number) => {
                  let icon;
                  if (amenity.toLowerCase().includes('wifi')) icon = <Wifi className="h-5 w-5 mr-2 text-green-600" />;
                  else if (amenity.toLowerCase().includes('tv')) icon = <Tv className="h-5 w-5 mr-2 text-green-600" />;
                  else if (amenity.toLowerCase().includes('parking')) icon = <Car className="h-5 w-5 mr-2 text-green-600" />;
                  else if (amenity.toLowerCase().includes('ac')) icon = <Thermometer className="h-5 w-5 mr-2 text-green-600" />;
                  else if (amenity.toLowerCase().includes('kitchen')) icon = <Utensils className="h-5 w-5 mr-2 text-green-600" />;
                  else if (amenity.toLowerCase().includes('gym')) icon = <Activity className="h-5 w-5 mr-2 text-green-600" />;
                  else icon = <CheckCircle className="h-5 w-5 mr-2 text-green-600" />;
                  
                  return (
                    <div 
                      key={index} 
                      className="flex items-center p-3 rounded-md bg-green-50"
                    >
                      {icon}
                      <span className="text-green-800">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* House Rules */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">House Rules</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {property.rules && property.rules.map((rule: string, index: number) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>

            {/* Location Map (placeholder) */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Location</h2>
              <div className="bg-gray-200 h-[300px] rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Map will be displayed here</p>
                {/* In a real app, this would be a Mapbox component */}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Price and Contact Card */}
            <div className="card sticky top-20 p-4 md:p-6 mb-6">
              <div className="mb-4">
                <div className="text-3xl font-bold text-primary-600 mb-1">₹{property.rent}<span className="text-lg text-gray-500 font-normal">/month</span></div>
                <div className="text-sm text-gray-600">Security Deposit: ₹{property.deposit}</div>
              </div>

              <button 
                className="btn btn-primary w-full mb-3"
                onClick={toggleContactForm}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Contact Owner
              </button>

              {isContactFormOpen && (
                <form onSubmit={handleSendMessage} className="mb-4">
                  <div className="mb-3">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="I'm interested in this property. Is it still available?"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-full text-sm md:text-base py-2 md:py-3">
                    Send Message
                  </button>
                </form>
              )}

              {/* Owner Profile Card */}
              <OwnerProfileCard 
                ownerId={property.ownerId} 
                onMessageClick={toggleContactForm} 
              />
              
              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <div>Listed on: {new Date(property.createdAt).toLocaleDateString()}</div>
                <div>Last updated: {new Date(property.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Property Stats */}
            <div className="card p-4">
              <div className="text-sm text-gray-600">This property is currently {property.status}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails; 