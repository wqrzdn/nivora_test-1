// React is automatically imported with JSX in newer versions
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import './App.css';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const PropertySearch = lazy(() => import('./pages/PropertySearch'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const PropertyForm = lazy(() => import('./pages/PropertyForm'));
const EditPropertyForm = lazy(() => import('./pages/EditPropertyForm'));
const MessagesPage = lazy(() => import('./components/messaging/MessagesPage'));
const MessageWindow = lazy(() => import('./components/messaging/MessageWindow'));
const MessageNotification = lazy(() => import('./components/messaging/MessageNotification'));
const MessageTestPage = lazy(() => import('./pages/MessageTestPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const ServiceProviderDashboard = lazy(() => import('./pages/ServiceProviderDashboard'));
const ServiceSearch = lazy(() => import('./pages/ServiceSearch'));
const RoommateSearch = lazy(() => import('./pages/RoommateSearch'));
const RoommateProfileDetail = lazy(() => import('./pages/RoommateProfileDetail'));
const RoommateProfileForm = lazy(() => import('./pages/RoommateProfileForm'));
// Firebase Test Component
const FirebaseTest = lazy(() => import('./components/FirebaseTest'));

// Layout components
import Layout from './components/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <MessageNotification />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="properties" element={<PropertySearch />} />
            <Route path="properties/:id" element={<PropertyDetails />} />
            <Route path="services" element={<ServiceSearch />} />
          </Route>
          
          {/* Protected Roommates routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/roommates" element={<RoommateSearch />} />
            <Route path="/roommates/profile/:id" element={<RoommateProfileDetail />} />
            <Route path="/roommates/create-profile" element={<RoommateProfileForm />} />
            <Route path="/roommates/edit-profile" element={<RoommateProfileForm />} />
          </Route>
          
          {/* Owner routes - protected */}
          <Route element={<ProtectedRoute requiredUserType="owner" />}>
            <Route path="/owner" element={<Layout isOwner />}>
              <Route index element={<OwnerDashboard />} />
              <Route path="properties/new" element={<PropertyForm />} />
              <Route path="properties/:id/edit" element={<EditPropertyForm />} />
              <Route path="properties/:id" element={<PropertyDetails />} />
              <Route path="properties" element={<PropertySearch ownerView />} />
              <Route path="services" element={<ServiceSearch />} />
              <Route path="applications" element={<div>Applications</div>} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>
          
          {/* Tenant routes - protected */}
          <Route element={<ProtectedRoute requiredUserType="tenant" />}>
            <Route path="/tenant" element={<Layout />}>
              <Route index element={<div>Tenant Dashboard</div>} />
              <Route path="properties" element={<PropertySearch />} />
              <Route path="services" element={<ServiceSearch />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="applications" element={<div>Applications</div>} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>
          
          {/* Service Provider routes - protected */}
          <Route element={<ProtectedRoute requiredUserType="service-provider" />}>
            <Route path="/service-provider" element={<Layout />}>
              <Route index element={<ServiceProviderDashboard />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>
          
          {/* Messaging routes */}
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:userId" element={<MessageWindow />} />
          
          {/* Profile routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<UserProfile />} />
          
          {/* Test routes */}
          <Route path="/message-test" element={<MessageTestPage />} />
          <Route path="/firebase-test" element={<FirebaseTest />} />
          
          {/* 404 route */}
          <Route path="*" element={<div className="min-h-screen flex justify-center items-center">Page not found</div>} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App; 