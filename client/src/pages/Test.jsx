import React, { useState } from 'react';
import { motion } from 'framer-motion';

function Test() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Cyberpunk Grid Background */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between p-4 border-b border-cyan-500/30 bg-slate-900/80 backdrop-blur-md"
      >
        <div className="flex items-center">
          <div className="mr-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">ECLIPSER</span>
            </div>
          </div>
          
          <ul className="flex space-x-8">
            <li>
              <motion.a 
                href="#" 
                whileHover={{ y: -2 }}
                className="border-b-2 border-cyan-400 pb-1 text-cyan-400 font-semibold relative group"
              >
                Dashboard
                <div className="absolute inset-0 bg-cyan-400/10 blur-sm group-hover:blur-md transition-all duration-300"></div>
              </motion.a>
            </li>
            <li className="flex items-center">
              <motion.a 
                href="#" 
                whileHover={{ y: -2 }}
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                Projects
              </motion.a>
              <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </li>
            <li>
              <motion.a 
                href="#" 
                whileHover={{ y: -2 }}
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                Analytics
              </motion.a>
            </li>
            <li>
              <motion.a 
                href="#" 
                whileHover={{ y: -2 }}
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                Settings
              </motion.a>
            </li>
            <li>
              <motion.a 
                href="#" 
                whileHover={{ y: -2 }}
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                Help
              </motion.a>
            </li>
          </ul>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(236, 72, 153, 0.6)" }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-300"
        >
          Deploy
        </motion.button>
      </motion.nav>

      <div className="flex">
        {/* Sidebar */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-64 bg-black border-r border-gray-800 h-screen sticky top-0"
        >
          <div className="p-4">
            {/* User Profile */}
            <div className="mb-6 bg-gray-900 rounded-lg overflow-hidden">
              <div className="p-0">
                <img 
                  src="https://placehold.co/200x200/111/333?text=User" 
                  alt="Profile" 
                  className="w-full h-44 object-cover"
                />
              </div>
              <div className="p-4">
                <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
              </div>
            </div>
            
            {/* Sidebar Menu */}
            <nav>
              <ul className="space-y-2">
                {[
                  { icon: "📋", text: "Ncde" },
                  { icon: "🔍", text: "78008C" },
                  { icon: "📁", text: "18882C" },
                  { icon: "📍", text: "#B1820" },
                  { icon: "⚡", text: "Seder" },
                  { icon: "🔑", text: "Lecler" },
                  { icon: "📊", text: "Megen" },
                  { icon: "🔄", text: "Cepa" },
                  { icon: "🔒", text: "Umter" },
                  { icon: "🛠️", text: "7B1880" },
                  { icon: "📝", text: "Sedne" },
                  { icon: "📦", text: "Cejaux" },
                  { icon: "🔔", text: "Sonere" },
                  { icon: "🌐", text: "Fog" },
                  { icon: "📱", text: "Suide" },
                  { icon: "🔗", text: "ColASO" },
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5, color: '#60a5fa' }}
                    className="flex items-center py-2 px-1"
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </nav>
            
            {/* Footer Menu */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="border-t border-gray-800 pt-4">
                <ul className="space-y-2">
                  {[
                    { icon: "⚙️", text: "Coege" },
                    { icon: "🔐", text: "Patrngrat" },
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      whileHover={{ x: 5, color: '#60a5fa' }}
                      className="flex items-center py-2 px-1"
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.text}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <h1 className="text-5xl font-bold mb-4">Stellar Noir & Cybernetic Hues</h1>
            <div className="w-1/3 h-1 bg-blue-500 rounded-full shadow-glow-blue"></div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
            <div className="space-y-6">
              {/* Accent One */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-900 rounded-lg p-5 border border-gray-800 shadow-lg relative"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Accent 1</h2>
                  <button className="text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-800 p-3 rounded flex justify-between items-center">
                    <div>
                      <div className="text-lg font-mono text-gray-300">#00F0FF</div>
                      <div className="text-xs text-gray-500">Primary Sonate Exrqubiturr</div>
                    </div>
                    <div>
                      <div className="h-8 w-8 rounded border border-gray-700"></div>
                    </div>
                  </div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-blue-600 p-3 rounded flex justify-between items-center cursor-pointer"
                  >
                    <div className="text-lg font-mono">#7B68EE</div>
                    <div>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </motion.div>
                </div>
                
                <div className="flex justify-center mt-6 space-x-2">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-600 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-600 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-600 rounded-full"></div>
                </div>
              </motion.div>

              {/* Accent Two */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-gray-900 rounded-lg p-5 border border-gray-800 shadow-lg relative"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Accent 2</h2>
                  <button className="text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <h3 className="text-xl font-semibold mb-4">Accent 2</h3>
                
                <div className="flex mb-4">
                  <div className="mr-4">
                    <div className="w-20 h-20 bg-blue-500 rounded flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-2">Alerts</h3>
                    <div className="bg-gray-800 rounded p-3 mb-3">
                      <span className="text-gray-300">Wening</span>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-red-600 text-sm px-3 py-1 rounded"
                      >
                        #FF4500
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-600 text-sm px-3 py-1 rounded flex items-center"
                      >
                        Meshen <span className="ml-1">›</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <div className="flex items-center">
                    <div className="flex -space-x-2 mr-2">
                      <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                      <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-sm">50999</div>
                      <div className="text-xs text-gray-500">Users connected</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-end">
                {/* Accent Three */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-gray-900 rounded-lg p-5 border border-gray-800 shadow-lg w-full max-w-xs"
                >
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">Accent 3</h2>
                  </div>
                  
                  <div className="mb-3">
                    <div className="font-mono text-lg">#FF4500</div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star, index) => (
                        <svg 
                          key={index}
                          className="w-4 h-4 text-gray-400" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="h-8 bg-gray-800 rounded w-full"></div>
                  </div>
                </motion.div>
              </div>

              <div className="flex justify-end">
                {/* Vor Otrade Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-gray-900 rounded-lg p-5 border border-gray-800 shadow-lg w-full max-w-xs mb-6"
                >
                  <div className="mb-2">
                    <h2 className="text-xl font-semibold">Vor Otrade</h2>
                    <div className="text-xs text-gray-500">Dottendje</div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="h-2 bg-gray-800 rounded-full relative">
                      <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-800 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-800 rounded w-1/3"></div>
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Optional Card with Glowing Border */}
              <div className="flex justify-end">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="relative max-w-xs w-full"
                >
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 rounded-lg bg-green-500 opacity-20 blur-sm"></div>
                  
                  <div className="relative bg-gray-900 rounded-lg p-5 border border-green-500 shadow-lg">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold">Optional</h2>
                      <div className="mt-2 text-green-500 text-xs font-mono">
                        <div>{'#0x%header {*/+#d'}</div>
                        <div>{'(0x8,$0x:>*/#%scut'}</div>
                        <div>{'%ed/sc/*$0x:cmd'}</div>
                      </div>
                    </div>
                    
                    <div className="font-mono text-xl text-green-400">#22FF22</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Test;