import { motion } from 'framer-motion';
import { useSelector } from "react-redux";
import Sidebar from './Sidebar';
import PostCards from './PostCards';
import RightSidebar from './RightSidebar';

const Feed = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-text">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className=""
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-orange bg-clip-text text-transparent">
              Code • Connect • Compete
            </h1>
            <div className="w-1/3 h-1 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full shadow-cyber-blue-glow animate-cyber-pulse"></div>
            

          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <PostCards />
            </div>
            <div className="lg:col-span-1">
              <RightSidebar />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Feed;