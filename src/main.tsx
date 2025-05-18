import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import './theme.css';
import { AuthProvider } from './context/AuthContext';
import { PropertyProvider } from './context/PropertyContext';
import { MessageProvider } from './context/MessageContext';
import { ApplicationProvider } from './context/ApplicationContext';
import { CommentProvider } from './context/CommentContext';
import { FavoriteProvider } from './context/FavoriteContext';
import { BookingProvider } from './context/BookingContext';
import { RoommateProvider } from './context/RoommateContext';
import { ServiceProvider } from './context/ServiceContext';
import { ServiceBookingProvider } from './context/ServiceBookingContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <PropertyProvider>
          <MessageProvider>
            <ApplicationProvider>
              <CommentProvider>
                <FavoriteProvider>
                  <BookingProvider>
                    <RoommateProvider>
                      <ServiceProvider>
                        <ServiceBookingProvider>
                          <App />
                        </ServiceBookingProvider>
                      </ServiceProvider>
                    </RoommateProvider>
                  </BookingProvider>
                </FavoriteProvider>
              </CommentProvider>
            </ApplicationProvider>
          </MessageProvider>
        </PropertyProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
); 