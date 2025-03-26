// src/components/Layout.jsx
import { memo } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <PersistentNavbar />
      <main className="flex-grow mt-16"> {/* Adjust mt based on navbar height */}
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