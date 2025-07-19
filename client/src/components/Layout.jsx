// src/components/Layout.jsx
import { memo } from 'react';
import Navbar from './newUI/Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-eclipse-light dark:bg-space-void text-eclipse-text-light dark:text-space-text">
      <PersistentNavbar />
      {/* Spacer for fixed navbar - increased height for better vertical centering */}
      <div className="h-20"></div>
      <main className="flex-grow bg-eclipse-light dark:bg-space-void">
        {children}
      </main>
      <PersistentFooter />
    </div>
  );
};

// Memoized components to prevent re-renders
const PersistentNavbar = memo(Navbar);
const PersistentFooter = memo(Footer);

export default Layout;