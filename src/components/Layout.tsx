import React from 'react';
import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import MessageNotification from './messaging/MessageNotification';

interface LayoutProps {
  isOwner?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ isOwner = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll listener to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header isScrolled={isScrolled} isOwner={isOwner} />
      <main className="flex-grow py-6">
        <MessageNotification />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 