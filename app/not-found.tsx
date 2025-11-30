'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiSearch, 
  FiBookOpen, 
  FiArrowLeft,
  FiRefreshCw,
  FiHelpCircle,
  FiMapPin
} from 'react-icons/fi';

export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleGoBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 Number */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-8xl md:text-9xl font-bold text-gray-900 leading-none">
            <span className="inline-block">4</span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block mx-2 w-16 h-16 md:w-20 md:h-20 bg-black rounded-full relative"
            >
              <FiBookOpen className="absolute inset-0 m-auto text-white w-8 h-8 md:w-10 md:h-10" />
            </motion.span>
            <span className="inline-block">4</span>
          </h1>
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            The learning resource you're looking for seems to have wandered off.
          </p>
          <p className="text-base text-gray-500">
            Don't worry, let's get you back on track to your educational journey!
          </p>
        </motion.div>

        {/* Floating Elements Animation */}
        <div className="relative mb-12 h-32">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute left-1/4 top-0 w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center"
          >
            <FiBookOpen className="w-4 h-4 text-gray-600" />
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              x: [0, 10, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute right-1/4 top-8 w-6 h-6 bg-gray-300 rounded-full"
          />
          
          <motion.div
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, -10, 10, 0]
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute left-1/3 bottom-0 w-4 h-4 bg-gray-400 rounded-sm transform rotate-45"
          />
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-4 mb-12"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 transform hover:scale-105"
            >
              <FiHome className="w-5 h-5 mr-2" />
              Go Home
            </Link>
            
            <button
              onClick={handleGoBack}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
          </div>

        </motion.div>

   
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-200 rounded-full opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-300 rounded-full opacity-20" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gray-100 rounded-full opacity-30" />
      </div>
    </div>
  );
}
