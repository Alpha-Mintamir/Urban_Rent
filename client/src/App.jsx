import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/ui/Layout';
import IndexPage from './pages/IndexPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import PlacesPage from './pages/PlacesPage';
import BookingsPage from './pages/BookingsPage';
import PlacesFormPage from './pages/PlacesFormPage';
import PlacePage from './pages/PlacePage';
import SingleBookedPlace from './pages/SingleBookedPlace';
import PropertyOwnerDashboard from './pages/PropertyOwnerDashboard';
import BrokerDashboard from './pages/BrokerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminBrokerVerification from './pages/AdminBrokerVerification';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminPropertyManagement from './pages/AdminPropertyManagement';
import AdminReportsPage from './pages/AdminReportsPage';
import ReviewsPage from './pages/ReviewsPage';
import MessagesPage from './pages/MessagesPage';
import BrokerVerificationPage from './pages/BrokerVerificationPage';
import axiosInstance from './utils/axios';
import { UserProvider } from './providers/UserProvider';
import { PlaceProvider } from './providers/PlaceProvider';
import { LanguageProvider } from './providers/LanguageProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getItemFromLocalStorage } from './utils';
import NotFoundPage from './pages/NotFoundPage';
import LocationVerificationPage from './pages/LocationVerificationPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import SettingsPage from './pages/SettingsPage';
import AuthGuard from '@/components/guards/AuthGuard';
import RoleGuard from '@/components/guards/RoleGuard';
import Home from './pages/Home';
import PropertyBrowsePage from './pages/PropertyBrowsePage';
import TenantPropertyDetailPage from './pages/TenantPropertyDetailPage';
import SavedPropertiesPage from './pages/SavedPropertiesPage';
import CombinedPropertyPage from './pages/CombinedPropertyPage';
import PropertyFormWithLocation from './pages/PropertyFormWithLocation';

function App() {
  useEffect(() => {
    // set the token on refreshing the website
    const token = getItemFromLocalStorage('token');
    if (token) {
      console.log('Setting token in axios defaults');
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      console.log('No token found in localStorage');
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <LanguageProvider>
          <UserProvider>
            <PlaceProvider>
              <Routes>
                <Route path="/" element={<Layout />}>
                  {/* Public Routes */}
                  <Route index element={<Home />} />
                  <Route path="/index" element={<IndexPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/browse" 
                    element={
                      <RoleGuard requiredRole={1}>
                        <PropertyBrowsePage />
                      </RoleGuard>
                    } 
                  />
                  <Route 
                    path="/account" 
                    element={
                      <AuthGuard>
                        <ProfilePage />
                      </AuthGuard>
                    } 
                  />
                  
                  {/* Admin Routes */}
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <RoleGuard requiredRole={4}>
                        <AdminDashboard />
                      </RoleGuard>
                    } 
                  />
                  <Route 
                    path="/admin/broker-verification" 
                    element={
                      <RoleGuard requiredRole={4}>
                        <AdminBrokerVerification />
                      </RoleGuard>
                    } 
                  />
                  <Route 
                    path="/admin/users" 
                    element={
                      <RoleGuard requiredRole={4}>
                        <AdminUserManagement />
                      </RoleGuard>
                    } 
                  />
                  <Route 
                    path="/admin/properties" 
                    element={
                      <RoleGuard requiredRole={4}>
                        <AdminPropertyManagement />
                      </RoleGuard>
                    } 
                  />
                  <Route 
                    path="/admin/reports"
                    element={
                      <RoleGuard requiredRole={4}>
                        <AdminReportsPage />
                      </RoleGuard>
                    } 
                  />
                  
                  {/* Property Owner Routes */}
                  <Route 
                    path="/owner/dashboard" 
                    element={
                      <RoleGuard requiredRole={2}>
                        <PropertyOwnerDashboard />
                      </RoleGuard>
                    } 
                  />
                  
                  {/* Broker Routes */}
                  <Route 
                    path="/broker/dashboard" 
                    element={
                      <RoleGuard requiredRole={3}>
                        <BrokerDashboard />
                      </RoleGuard>
                    } 
                  />
                  
                  {/* Property Owner Reviews */}
                  <Route 
                    path="/account/reviews" 
                    element={
                      <RoleGuard requiredRole={2}>
                        <ReviewsPage />
                      </RoleGuard>
                    } 
                  />
                  
                  {/* Broker Reviews */}
                  <Route 
                    path="/broker/reviews" 
                    element={
                      <RoleGuard requiredRole={3}>
                        <ReviewsPage />
                      </RoleGuard>
                    } 
                  />
                  
                  {/* Property Owner Messages */}
                  <Route 
                    path="/account/messages" 
                    element={
                      <RoleGuard requiredRole={2}>
                        <MessagesPage />
                      </RoleGuard>
                    } 
                  />
                  
                  {/* Broker Messages */}
                  <Route 
                    path="/broker/messages" 
                    element={
                      <RoleGuard requiredRole={3}>
                        <MessagesPage />
                      </RoleGuard>
                    } 
                  />
                  
                  {/* Broker Verification */}
                  <Route 
                    path="/broker/verification" 
                    element={
                      <RoleGuard requiredRole={3}>
                        <BrokerVerificationPage />
                      </RoleGuard>
                    } 
                  />
                  
                  {/* Property Owner Places */}
                  <Route 
                    path="/account/places" 
                    element={
                      <AuthGuard>
                        <PlacesPage />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/account/places/new" 
                    element={
                      <AuthGuard>
                        <PlacesFormPage />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/account/places/edit/:id" 
                    element={
                      <AuthGuard>
                        <PlacesFormPage />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/account/places/:id" 
                    element={
                      <AuthGuard>
                        <PlacePage />
                      </AuthGuard>
                    } 
                  />
                  
                  {/* New Combined Property Page */}
                  {/* Removing redundant properties routes
                  <Route 
                    path="/account/properties" 
                    element={
                      <AuthGuard>
                        <CombinedPropertyPage />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/account/properties/:id" 
                    element={
                      <AuthGuard>
                        <CombinedPropertyPage />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/broker/properties" 
                    element={
                      <RoleGuard requiredRole={3}>
                        <CombinedPropertyPage />
                      </RoleGuard>
                    } 
                  />
                  <Route 
                    path="/broker/properties/:id" 
                    element={
                      <RoleGuard requiredRole={3}>
                        <CombinedPropertyPage />
                      </RoleGuard>
                    } 
                  />
                  */}
                  
                  {/* Broker Places */}
                  <Route 
                    path="/broker/places" 
                    element={
                      <RoleGuard requiredRole={3}>
                        <PlacesPage />
                      </RoleGuard>
                    } 
                  />
                  <Route 
                    path="/broker/places/new" 
                    element={
                      <RoleGuard requiredRole={3}>
                        <PlacesFormPage />
                      </RoleGuard>
                    } 
                  />
                  <Route 
                    path="/broker/places/:id" 
                    element={
                      <RoleGuard requiredRole={3}>
                        <PlacesFormPage />
                      </RoleGuard>
                    } 
                  />
                  
                  {/* Broker Deals and Clients */}
                  <Route 
                    path="/broker/deals" 
                    element={
                      <RoleGuard requiredRole={3}>
                        <BrokerDashboard />
                      </RoleGuard>
                    } 
                  />
                  <Route 
                    path="/broker/clients" 
                    element={
                      <RoleGuard requiredRole={3}>
                        <BrokerDashboard />
                      </RoleGuard>
                    } 
                  />
                  
                  {/* Property Detail Routes */}
                  <Route 
                    path="/property/:id" 
                    element={
                      <AuthGuard>
                        <TenantPropertyDetailPage />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/property/detail/:id" 
                    element={
                      <AuthGuard>
                        <PropertyDetailPage />
                      </AuthGuard>
                    } 
                  />
                  
                  {/* Account Routes */}
                  <Route 
                    path="/account/bookings" 
                    element={
                      <AuthGuard>
                        <BookingsPage />
                      </AuthGuard>
                    } 
                  />
                  <Route
                    path="/account/bookings/:id"
                    element={
                      <AuthGuard>
                        <SingleBookedPlace />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/account/verify-location"
                    element={
                      <AuthGuard>
                        <LocationVerificationPage />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/account/settings"
                    element={
                      <AuthGuard>
                        <SettingsPage />
                      </AuthGuard>
                    }
                  />
                  
                  {/* New Combined Property Form with Location */}
                  <Route 
                    path="/account/property/new"
                    element={
                      <AuthGuard>
                        <PropertyFormWithLocation />
                      </AuthGuard>
                    }
                  />
                  <Route 
                    path="/account/property/edit/:id"
                    element={
                      <AuthGuard>
                        <PropertyFormWithLocation />
                      </AuthGuard>
                    }
                  />
                  <Route 
                    path="/broker/property/new"
                    element={
                      <RoleGuard requiredRole={3}>
                        <PropertyFormWithLocation />
                      </RoleGuard>
                    }
                  />
                  <Route 
                    path="/broker/property/edit/:id"
                    element={
                      <RoleGuard requiredRole={3}>
                        <PropertyFormWithLocation />
                      </RoleGuard>
                    }
                  />
                  
                  {/* Tenant Routes */}
                  <Route 
                    path="/tenant/settings"
                    element={
                      <RoleGuard requiredRole={1}>
                        <SettingsPage />
                      </RoleGuard>
                    }
                  />
                  <Route 
                    path="/tenant/bookings"
                    element={
                      <RoleGuard requiredRole={1}>
                        <BookingsPage />
                      </RoleGuard>
                    }
                  />
                  <Route 
                    path="/tenant/messages"
                    element={
                      <RoleGuard requiredRole={1}>
                        <MessagesPage />
                      </RoleGuard>
                    }
                  />
                  <Route 
                    path="/tenant/saved"
                    element={
                      <RoleGuard requiredRole={1}>
                        <SavedPropertiesPage />
                      </RoleGuard>
                    }
                  />
                  
                  {/* Catch-all Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
              <ToastContainer autoClose={2000} transition={Slide} />
            </PlaceProvider>
          </UserProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
