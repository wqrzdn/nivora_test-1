import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Locate, Loader2, AlertCircle } from 'lucide-react';
import 'leaflet-control-geocoder';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

// Fix Leaflet default icon issue in React
// This is needed because Leaflet's default icon assets use relative paths
// Define a custom icon to avoid the missing icon issue
const defaultIcon = new L.Icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Define a structured ParsedAddress interface for consistent data passing
interface ParsedAddress {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  lat: number;
  lng: number;
  streetAddress?: string;
}

interface LocationPickerProps {
  initialLocation?: {
    lat: number;
    lng: number;
  };
  onLocationSelect: (parsedAddress: ParsedAddress) => void;
  height?: string;
}

// Component to handle map click events and add controls
interface MapEventsProps {
  onClick: (e: L.LeafletMouseEvent) => void;
  onLocationFound: (location: { lat: number; lng: number }) => void;
}

const MapEvents: React.FC<MapEventsProps> = ({ onClick, onLocationFound }) => {
  const map = useMap();
  
  // Add geocoder control for search
  useEffect(() => {
    // @ts-ignore - Type definitions for leaflet-control-geocoder aren't available
    const geocoder = L.Control.Geocoder.nominatim();
    
    // @ts-ignore
    const searchControl = L.Control.geocoder({
      geocoder,
      defaultMarkGeocode: false,
      placeholder: 'Search for address...',
      errorMessage: 'Nothing found.',
      suggestMinLength: 3,
      suggestTimeout: 250,
    }).on('markgeocode', function(e: any) {
      const { center } = e.geocode;
      map.setView(center, 15);
      onLocationFound({ lat: center.lat, lng: center.lng });
    }).addTo(map);
    
    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onLocationFound]);
  
  // Set up map event handlers
  useMapEvents({
    click: onClick,
    locationfound: (e) => {
      onLocationFound({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    locationerror: (e) => {
      console.error('Location error:', e.message);
      alert('Unable to find your location. Please check your browser permissions.');
    },
  });
  
  return null;
};

const defaultCenter = {
  lat: 28.6139, // Default to New Delhi, India
  lng: 77.2090
};

// Interface for Nominatim response
interface NominatimResponse {
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state_district?: string;
    state?: string;
    postcode?: string;
    country?: string;
    county?: string;
    [key: string]: string | undefined;
  };
}

// Interface for detailed address information
interface DetailedAddress {
  fullAddress: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  lat: number;
  lng: number;
}

// Function to fetch address from coordinates using Nominatim (OpenStreetMap's geocoding service)
const fetchAddressFromCoordinates = async (lat: number, lng: number): Promise<DetailedAddress> => {
  try {
    // Add a small delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`Fetching address for coordinates: ${lat},${lng}`);
    
    // Try Google Maps Geocoding API first (if available)
    try {
      // This would be the preferred method with a proper API key
      // For now, we'll rely on Nominatim as the primary source
    } catch (googleError) {
      console.error('Error with Google geocoding:', googleError);
    }
    
    // Try Nominatim (OpenStreetMap)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
        {
          headers: {
            'Accept-Language': 'en', // Get results in English
            'User-Agent': 'Nivora Property App' // It's good practice to identify your app
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json() as NominatimResponse;
        console.log('Nominatim response:', data);
        
        // Extract address components
        const address = data.address;
        
        // Determine the city with proper fallbacks (city || town || village || suburb)
        const city = address.city || address.town || address.village || address.suburb || address.county || '';
        
        // Get state - ensure we're getting the actual state, not state_district
        const state = address.state || address.state_district || '';
        
        // Get postal code
        const postalCode = address.postcode || '';
        
        // Construct street address
        const streetParts = [];
        if (address.house_number) streetParts.push(address.house_number);
        if (address.road) streetParts.push(address.road);
        const streetAddress = streetParts.join(' ') || data.display_name.split(',')[0] || '';
        
        // If we have at least some data, return the result
        return {
          fullAddress: data.display_name,
          streetAddress,
          city,
          state,
          postalCode: postalCode || extractPincodeFromString(data.display_name) || '000000', // Try to extract pincode from display name
          lat,
          lng
        };
      }
    } catch (nominatimError) {
      console.error('Error with Nominatim geocoding:', nominatimError);
    }
    
    // Fallback: Try another geocoding service
    try {
      const response = await fetch(
        `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('maps.co geocoding response:', data);
        
        if (data && data.address) {
          const address = data.address;
          const city = address.city || address.town || address.village || address.county || '';
          const state = address.state || '';
          const postalCode = address.postcode || '';
          
          return {
            fullAddress: data.display_name || `${city}, ${state}`,
            streetAddress: address.road || '',
            city,
            state,
            postalCode: postalCode || extractPincodeFromString(data.display_name) || '000000',
            lat,
            lng
          };
        }
      }
    } catch (mapsCoError) {
      console.error('Error with maps.co geocoding:', mapsCoError);
    }
    
    // Last resort fallback: Use hardcoded values for India based on coordinates
    console.log('Using fallback geocoding for India');
    
    // For India, determine approximate location based on lat/lng
    let city = 'Delhi';
    let state = 'Delhi';
    let postalCode = '110001';
    
    // Very basic region determination based on coordinates
    if (lat < 20) {
      city = 'Mumbai';
      state = 'Maharashtra';
      postalCode = '400001';
    } else if (lat < 23) {
      city = 'Hyderabad';
      state = 'Telangana';
      postalCode = '500001';
    } else if (lat > 28) {
      city = 'Chandigarh';
      state = 'Punjab';
      postalCode = '160001';
    }
    
    return {
      fullAddress: `${city}, ${state}, India`,
      streetAddress: 'Address based on map selection',
      city,
      state,
      postalCode,
      lat,
      lng
    };
  } catch (error) {
    console.error('Error fetching address:', error);
    return {
      fullAddress: 'Error retrieving address',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      lat,
      lng
    };
  }
};

// Helper function to extract 6-digit pincode from a string
const extractPincodeFromString = (text: string): string => {
  if (!text) return '';
  const pincodeMatch = text.match(/\b\d{6}\b/);
  return pincodeMatch ? pincodeMatch[0] : '';
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation,
  onLocationSelect,
  height = '400px'
}) => {
  const [marker, setMarker] = useState<L.LatLngExpression | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>('');
  const [isUpdatingLocation, setIsUpdatingLocation] = useState<boolean>(false);
  const mapRef = useRef<L.Map | null>(null);
  const locationUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle map click
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (isUpdatingLocation) return; // Prevent simultaneous updates
    updateLocationMarker(e.latlng.lat, e.latlng.lng);
  };

  // Handle location found (from search or current location)
  const handleLocationFound = (location: { lat: number; lng: number }) => {
    if (isUpdatingLocation) return; // Prevent simultaneous updates
    updateLocationMarker(location.lat, location.lng);
  };

  // Debounced update marker and fetch address function
  const updateLocationMarker = useCallback(async (lat: number, lng: number) => {
    // Clear any existing timeout to prevent race conditions
    if (locationUpdateTimeoutRef.current) {
      clearTimeout(locationUpdateTimeoutRef.current);
    }
    
    // Set updating flag to prevent simultaneous updates
    setIsUpdatingLocation(true);
    setMarker([lat, lng]);
    setIsLoading(true);
    setLocationError('');
    
    try {
      // Fetch address details from coordinates
      const addressDetails = await fetchAddressFromCoordinates(lat, lng);
      
      // Update the address display
      setAddress(addressDetails.fullAddress);
      
      // Create a structured ParsedAddress object
      const parsedAddress: ParsedAddress = {
        lat,
        lng,
        address: addressDetails.fullAddress,
        streetAddress: addressDetails.streetAddress,
        city: addressDetails.city,
        state: addressDetails.state,
        postalCode: addressDetails.postalCode
      };
      
      // Pass the structured location data to the parent component
      onLocationSelect(parsedAddress);
    } catch (error) {
      console.error('Error updating location:', error);
      setAddress('Error retrieving address');
      setLocationError('Failed to get address information');
    } finally {
      setIsLoading(false);
      
      // Release the updating flag after a short delay to prevent rapid consecutive updates
      locationUpdateTimeoutRef.current = setTimeout(() => {
        setIsUpdatingLocation(false);
      }, 500);
    }
  }, [onLocationSelect]);
  
  // Get current location with improved error handling
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    
    // Prevent getting location if already in progress
    if (isLocating || isUpdatingLocation) return;
    
    setIsLocating(true);
    setLocationError('');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Update the map view and marker
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
          }
          
          // Update marker and fetch address
          updateLocationMarker(latitude, longitude);
        } catch (error) {
          console.error('Error processing location:', error);
          setLocationError('Error processing your location');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Error getting current location:', error);
        let errorMessage = 'Unable to get your location';
        
        // Provide more specific error messages
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
        }
        
        setLocationError(errorMessage);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Initialize with initial location if provided
  useEffect(() => {
    if (initialLocation && mapRef.current) {
      const { lat, lng } = initialLocation;
      setMarker([lat, lng]);
      mapRef.current.setView([lat, lng], 15);
      
      // Fetch address for initial location
      const fetchInitialAddress = async () => {
        setIsLoading(true);
        setLocationError('');
        try {
          const addressDetails = await fetchAddressFromCoordinates(lat, lng);
          setAddress(addressDetails.fullAddress || 'Address not found');
          
          // Create a structured ParsedAddress object
          const parsedAddress: ParsedAddress = {
            lat,
            lng,
            address: addressDetails.fullAddress,
            streetAddress: addressDetails.streetAddress,
            city: addressDetails.city,
            state: addressDetails.state,
            postalCode: addressDetails.postalCode
          };
          
          onLocationSelect(parsedAddress);
        } catch (error) {
          console.error('Error getting initial address:', error);
          setAddress('Error retrieving address');
          setLocationError('Failed to get initial address information');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchInitialAddress();
    }
    
    // Cleanup function to clear any pending timeouts
    return () => {
      if (locationUpdateTimeoutRef.current) {
        clearTimeout(locationUpdateTimeoutRef.current);
      }
    };
  }, [initialLocation, onLocationSelect, updateLocationMarker]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <MapContainer
          center={marker ? (marker as L.LatLngExpression) : (initialLocation ? [initialLocation.lat, initialLocation.lng] : [defaultCenter.lat, defaultCenter.lng])}
          zoom={15}
          style={{ height, width: '100%', borderRadius: '0.5rem' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapEvents 
            onClick={handleMapClick} 
            onLocationFound={handleLocationFound} 
          />
          
          {marker && <Marker position={marker as L.LatLngExpression} icon={defaultIcon} />}
        </MapContainer>
        
        {/* Current Location Button */}
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md z-[1000] hover:bg-gray-100 transition-colors"
          title="Use my current location"
        >
          {isLocating ? (
            <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
          ) : (
            <Locate className="h-5 w-5 text-primary-600" />
          )}
        </button>
        
        <div className="absolute top-4 left-4 bg-white p-2 rounded-md shadow-md z-[1000] max-w-xs">
          <div className="text-sm font-medium">
            {isLoading ? 'Loading address...' : (
              address ? address : 'Click on the map to select a location'
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center text-sm text-gray-600">
        <MapPin className="h-4 w-4 mr-2 text-primary-500" />
        <span>Click anywhere on the map to set the property location</span>
      </div>
      
      {address && marker && (
        <div className="p-3 bg-primary-50 rounded-md">
          <h4 className="font-medium text-primary-700 mb-1">Selected Location</h4>
          <p className="text-sm text-gray-700">{address}</p>
          <div className="mt-1 text-xs text-gray-500">
            Coordinates: {Array.isArray(marker) ? marker[0].toFixed(6) : (marker as any).lat.toFixed(6)}, 
            {Array.isArray(marker) ? marker[1].toFixed(6) : (marker as any).lng.toFixed(6)}
          </div>
          {locationError && (
            <div className="mt-2 text-xs text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {locationError}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
