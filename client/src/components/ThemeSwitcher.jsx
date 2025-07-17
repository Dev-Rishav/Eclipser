import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher = () => {
  const { theme, changeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '🌓' },
  ];

  const currentTheme = themes.find(t => t.value === theme);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-eclipse-surface dark:bg-space-darker border border-eclipse-border dark:border-space-gray text-eclipse-text-light dark:text-space-text transition-colors hover:border-stellar-blue"
      >
        <span>{currentTheme?.icon}</span>
        <span className="text-sm hidden sm:inline">{currentTheme?.label}</span>
        <motion.svg 
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="w-4 h-4"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 bg-eclipse-surface dark:bg-space-darker border border-eclipse-border dark:border-space-gray rounded-lg shadow-space-card dark:shadow-stellar-blue-glow overflow-hidden z-50"
          >
            {themes.map((themeOption) => (
              <motion.button
                key={themeOption.value}
                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                onClick={() => {
                  changeTheme(themeOption.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  theme === themeOption.value 
                    ? 'bg-stellar-blue/10 text-stellar-blue' 
                    : 'text-eclipse-text-light dark:text-space-text hover:text-stellar-blue'
                }`}
              >
                <span>{themeOption.icon}</span>
                <span className="text-sm">{themeOption.label}</span>
                {theme === themeOption.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-2 h-2 bg-stellar-blue rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeSwitcher;
