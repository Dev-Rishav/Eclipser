// src/components/Navbar.js

import React from "react";
import { motion } from  "framer-motion";

// Import your two navbar components
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";

const Navbar = () => {
  return (
    <>
      {/* Cockpit Status Strip (Shared visual element) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed top-0 left-0 right-0 z-[60] h-1 bg-gradient-to-r from-stellar-blue via-stellar-purple to-stellar-orange"
      >
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="h-full w-20 bg-white/30 blur-sm"
        />
      </motion.div>

      {/* Main Nav Container */}
      <header
        className="fixed top-1 left-0 right-0 z-50 border-b border-stellar-blue/20 bg-gradient-to-r from-eclipse-surface/95 via-eclipse-border/95 to-eclipse-surface/95 dark:from-space-darker/95 dark:via-space-dark/95 dark:to-space-darker/95 backdrop-blur-lg shadow-lg"
      >
        {/* Render Desktop Navbar: Hidden on small screens, visible on medium and up */}
        <div className="hidden md:block">
          <DesktopNavbar />
        </div>

        {/* Render Mobile Navbar: Visible on small screens, hidden on medium and up */}
        <div className="md:hidden">
          <MobileNavbar />
        </div>
      </header>
    </>
  );
};

export default Navbar;