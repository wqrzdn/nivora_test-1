// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'owner' | 'tenant';
  createdAt: string;
  avatarUrl?: string;
  phone?: string;
}

export interface Owner extends User {
  userType: 'owner';
  properties: string[]; // Array of property IDs
  responseRate?: number;
  responseTime?: string;
}

export interface Tenant extends User {
  userType: 'tenant';
  favoriteProperties?: string[]; // Array of property IDs
  savedSearches?: SavedSearch[];
  roommateProfile?: RoommateProfile;
}

// Property Types
export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  propertyType: 'Apartment' | 'Villa' | 'PG' | 'Studio' | 'Commercial';
  location: {
    address: string;
    area: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  price: {
    rent: number;
    deposit: number;
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    area: number; // in sq. ft.
    furnished: 'Fully' | 'Semi' | 'Unfurnished';
    floor?: number;
    totalFloors?: number;
    facing?: string;
    availableFrom: string; // ISO date string
    minLeaseDuration?: number; // in months
  };
  amenities: Amenity[];
  rules: string[];
  images: string[]; // Array of image URLs
  roommateOption: boolean;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'rented' | 'inactive';
  viewCount: number;
}

export interface Amenity {
  name: string;
  icon: string;
  available: boolean;
}

// Roommate Types
export interface RoommateProfile {
  id: string;
  userId: string;
  gender: 'Male' | 'Female' | 'Non-binary' | 'Other';
  age: number;
  occupation: string;
  budget: number;
  moveInDate: string; // ISO date string
  location: string;
  description: string;
  lookingFor: string;
  interests: string[];
  lifestyle: {
    smoking: boolean;
    drinking: boolean;
    pets: boolean;
    visitors: boolean;
    workFromHome: boolean;
    nightOwl: boolean;
  };
  preferredGender?: 'Male' | 'Female' | 'No Preference';
  preferredAgeRange?: {
    min: number;
    max: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RoommateMatch {
  id: string;
  roommateId1: string;
  roommateId2: string;
  matchScore: number;
  createdAt: string;
}

// Message Types
export interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs
  propertyId?: string; // Optional, if the conversation is about a property
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

// Application Types
export interface PropertyApplication {
  id: string;
  propertyId: string;
  tenantId: string;
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  moveInDate: string; // ISO date string
  leaseDuration?: number; // in months
  createdAt: string;
  updatedAt: string;
}

// Search Related
export interface SearchFilters {
  location?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  propertyType?: string;
  furnished?: string;
  availableFrom?: string;
  amenities?: string[];
}

export interface SavedSearch {
  id: string;
  userId: string;
  filters: SearchFilters;
  name: string;
  createdAt: string;
}

// Authentication Types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  userType: 'owner' | 'tenant';
} 