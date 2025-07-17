// src/components/Layout.jsx
import { memo } from 'react';
import Navbar from './newUI/Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-cyber-black text-cyber-text">
      <PersistentNavbar />
      <main className="flex-grow bg-gradient-to-br from-cyber-black via-cyber-dark to-cyber-black">
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