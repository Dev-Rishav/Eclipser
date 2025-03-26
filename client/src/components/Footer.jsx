// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  console.log("footer painted");
  
  return (
    <footer className="bg-gradient-to-r from-cosmic to-stellar border-t border-nebula border-opacity-30 backdrop-filter backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-stardust text-sm">
            © {new Date().getFullYear()} Eclipser. Cosmic Connections.
          </div>
          <div className="flex space-x-6">
            <a href="/about" className="text-stardust hover:text-corona transition-colors">
              About
            </a>
            <a href="/terms" className="text-stardust hover:text-corona transition-colors">
              Terms
            </a>
            <a href="/privacy" className="text-stardust hover:text-corona transition-colors">
              Privacy
            </a>
          </div>
        </div>
        <div className="mt-4 text-center text-stardust text-opacity-70 text-xs">
          Explore the knowledge universe 🌌
        </div>
      </div>
    </footer>
  );
};

export default Footer;