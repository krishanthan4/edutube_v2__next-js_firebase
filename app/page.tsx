'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCourses } from '../lib/firestore';
import { Course } from '../types';
import Navbar from './components/Navbar';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowRight,
  FiBookOpen,
  FiUsers,
  FiZap,
  FiStar,
  FiPlay,
  FiTarget,
  FiTrendingUp,
  FiGlobe,
  FiShield,
  FiHeart,
  FiBarChart,
  FiShare2,
  FiFolder,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiYoutube,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiDollarSign,
  FiLock,
  FiUnlock,
  FiSmartphone,
  FiMail
} from 'react-icons/fi';
import Footer from './components/LandingPage/Footer';
import CTA from './components/LandingPage/CTA';
import FAQ from './components/LandingPage/FAQ';
import Advantages from './components/LandingPage/Advantages';
import DemoVideo from './components/LandingPage/DemoVideo';

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publicCourses: 0,
    totalStudents: 0
  });
  const [showPremium, setShowPremium] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const allCourses = await getCourses();
        // Show only public courses for featured section
        const publicCourses = allCourses.filter(course => course.isPublic);
        // Get the 6 newest public courses
        const featured = publicCourses
          .sort((a, b) => new Date(b.createdAt?.toDate() || 0).getTime() - new Date(a.createdAt?.toDate() || 0).getTime())
          .slice(0, 6);
        
        setFeaturedCourses(featured as Course[]);
        setStats({
          totalCourses: allCourses.length,
          publicCourses: publicCourses.length,
          totalStudents: Math.floor(Math.random() * 5000) + 1000 // Simulated for demo
        });
      } catch (error) {
        console.error('Error fetching featured courses:', error);
      }
    };

    fetchFeaturedCourses();
  }, []);

  // Animation cycle effect
  useEffect(() => {
    const animationCycle = () => {
      setShowPremium(true);
      setTimeout(() => {
        setShowPremium(false);
      }, 3000);
    };

    // Start first animation after 1 second
    const initialTimeout = setTimeout(animationCycle, 1000);
    
    // Repeat every 5 seconds
    const interval = setInterval(animationCycle, 5000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section - YouTube to Premium Courses */}
      <section className="relative bg-black text-white overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Main Message */}
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2">
                  <FiZap className="w-4 h-4" />
                  <span>TRANSFORM YOUR LEARNING</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Turn <span className="text-red-500 inline-flex items-center">
                  <FiYoutube className="w-14 h-14 mr-4" />
                  YouTube
                </span>
                <br />
                Playlists Into
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-yellow-500">
                  Premium Courses
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Transform scattered YouTube playlists into structured, trackable learning experiences. 
                Get all the benefits of premium education platforms - <span className="text-orange-400 font-bold">completely free</span>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/courses"
                  className="inline-flex items-center px-8 py-4 bg-orange-500 text-black text-lg font-bold rounded-full hover:bg-orange-400 transition-all transform hover:scale-105 group"
                >
                  <span>Start Learning Free</span>
                  <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                {!user ? (
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-lg font-bold rounded-full hover:bg-white hover:text-black transition-all"
                  >
                    Create Your List
                  </Link>
                ) : (
                  <Link
                    href="/courses/create"
                    className="inline-flex items-center px-8 py-4 border-2 border-orange-500 text-orange-500 text-lg font-bold rounded-full hover:bg-orange-500 hover:text-black transition-all"
                  >
                    Create Course
                  </Link>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-orange-400 mb-1">{stats.totalCourses}+</div>
                  <div className="text-gray-400 text-sm">Courses Created</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-400 mb-1">∞</div>
                  <div className="text-gray-400 text-sm">Always Free</div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Animated YouTube to Premium Transformation */}
            <div className="relative">
              <div className="relative w-full max-w-md mx-auto">
                {/* Container for the transformation animation */}
                <div className="relative bg-gray-900 rounded-2xl p-6 border border-gray-800 overflow-hidden min-h-[320px]">
                  
                  {/* YouTube Playlist Skeleton (Always visible as base) */}
                  <motion.div 
                  className="absolute inset-6"
                  animate={{ opacity: showPremium ? 0 : 1 }}
                  transition={{ duration: 0.5 }}
                  >
                  <div className="flex items-center mb-4">
                    <FiYoutube className="w-6 h-6 text-red-500 mr-3" />
                    <span className="text-gray-400 font-medium">YouTube Playlist</span>
                  </div>
                  <div className="space-y-3">
                    {/* Video 1 */}
                    <motion.div 
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    >
                    <div className="w-16 h-10 bg-gray-800 rounded flex items-center justify-center">
                      <FiPlay className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <motion.div 
                      className="h-3 bg-gray-700 rounded mb-1"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div 
                      className="h-2 bg-gray-800 rounded w-2/3"
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      />
                    </div>
                    </motion.div>
                    
                    {/* Video 2 */}
                    <motion.div 
                    className="flex items-center space-x-3 opacity-60"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 0.6, x: 0 }}
                    transition={{ delay: 0.2 }}
                    >
                    <div className="w-16 h-10 bg-gray-800 rounded flex items-center justify-center">
                      <FiPlay className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <motion.div 
                      className="h-3 bg-gray-700 rounded mb-1"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div 
                      className="h-2 bg-gray-800 rounded w-1/2"
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                      />
                    </div>
                    </motion.div>
                    
                    {/* Video 3 */}
                    <motion.div 
                    className="flex items-center space-x-3 opacity-40"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 0.4, x: 0 }}
                    transition={{ delay: 0.3 }}
                    >
                    <div className="w-16 h-10 bg-gray-800 rounded flex items-center justify-center">
                      <FiPlay className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <motion.div 
                      className="h-3 bg-gray-700 rounded mb-1"
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                      />
                      <motion.div 
                      className="h-2 bg-gray-800 rounded w-3/4"
                      animate={{ opacity: [0.1, 0.3, 0.1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
                      />
                    </div>
                    </motion.div>
                  </div>
                  <motion.div 
                    className="mt-4 text-red-400 text-sm flex items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <FiX className="w-4 h-4 mr-2" />
                    No progress tracking
                  </motion.div>
                  </motion.div>

                  {/* Premium Course Skeleton (Slides in from right) */}
                  <AnimatePresence>
                  {showPremium && (
                    <motion.div 
                    className="absolute inset-6"
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 100, 
                      damping: 20,
                      duration: 0.8
                    }}
                    >
                    <div className="flex items-center mb-4">
                      <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      >
                      <FiStar className="w-6 h-6 text-orange-400 mr-3" />
                      </motion.div>
                      <span className="text-orange-400 font-medium">Premium Course</span>
                    </div>
                    <div className="space-y-3">
                      {/* Lesson 1 - Completed */}
                      <motion.div 
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      >
                      <div className="relative w-16 h-10 bg-orange-500/30 rounded border border-orange-400 flex items-center justify-center">
                        <FiPlay className="w-4 h-4 text-orange-400" />
                        <motion.div 
                        className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                        >
                        <FiCheckCircle className="w-3 h-3 text-white" />
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-orange-400 rounded mb-1"></div>
                        <div className="h-2 bg-yellow-400 rounded w-2/3"></div>
                      </div>
                      <motion.div 
                        className="w-12 h-2 bg-gray-600 rounded-full relative overflow-hidden"
                        initial={{ width: 0 }}
                        animate={{ width: 48 }}
                        transition={{ delay: 0.8 }}
                      >
                        <motion.div 
                        className="h-full bg-green-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 1, duration: 0.5 }}
                        />
                      </motion.div>
                      </motion.div>
                      
                      {/* Lesson 2 - In Progress */}
                      <motion.div 
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      >
                      <div className="relative w-16 h-10 bg-yellow-500/30 rounded border border-yellow-400 flex items-center justify-center">
                        <FiPlay className="w-4 h-4 text-yellow-400" />
                        <motion.div 
                        className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
                        >
                        <motion.div 
                          className="w-2 h-2 bg-white rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-yellow-400 rounded mb-1"></div>
                        <div className="h-2 bg-orange-400 rounded w-1/2"></div>
                      </div>
                      <motion.div 
                        className="w-12 h-2 bg-gray-600 rounded-full relative overflow-hidden"
                        initial={{ width: 0 }}
                        animate={{ width: 48 }}
                        transition={{ delay: 0.9 }}
                      >
                        <motion.div 
                        className="h-full bg-yellow-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "50%" }}
                        transition={{ delay: 1.1, duration: 0.5 }}
                        />
                      </motion.div>
                      </motion.div>
                      
                      {/* Lesson 3 - Upcoming */}
                      <motion.div 
                      className="flex items-center space-x-3 opacity-60"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 0.6, y: 0 }}
                      transition={{ delay: 0.6 }}
                      >
                      <div className="w-16 h-10 bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
                        <FiPlay className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-600 rounded mb-1"></div>
                        <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                      </div>
                      <div className="w-12 bg-gray-600 h-2 rounded-full"></div>
                      </motion.div>
                    </div>
                    <motion.div 
                      className="mt-4 text-green-400 text-sm flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.3, type: "spring", stiffness: 300 }}
                      >
                      <FiCheckCircle className="w-4 h-4 mr-2" />
                      </motion.div>
                      Progress tracked & structured
                    </motion.div>
                    </motion.div>
                  )}
                  </AnimatePresence>

                  {/* Diagonal Line Effect */}
                  <AnimatePresence>
                  {showPremium && (
                    <motion.div
                    className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 via-yellow-400 to-orange-500 transform origin-top-left rotate-45"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      ease: "easeInOut",
                      delay: 0.2
                    }}
                    style={{
                      height: "141%", // ~1.414 * 100% to cover diagonal
                      left: "-1px",
                      top: "-20%"
                    }}
                    />
                  )}
                  </AnimatePresence>
                </div>

                {/* Text below the animation */}
                <motion.div 
                  className="text-center mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.p 
                    className="text-xl font-bold text-orange-400 mb-2"
                    animate={{ 
                      scale: showPremium ? 1.05 : 1,
                      color: showPremium ? "#fb923c" : "#f97316"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    Transform Your Learning
                  </motion.p>
                  <p className="text-gray-300">
                    Convert <span className="text-red-500">YouTube Playlists</span> to <span className="text-orange-400">Premium Courses</span>
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
<DemoVideo/>
      {/* Why This Special Section */}
    <Advantages/>

      {/* FAQ Section */}
     <FAQ openFaq={openFaq} setOpenFaq={setOpenFaq}/>


      {/* CTA Section */}
   <CTA user={user}/>

      {/* Footer */}
 <Footer user={user}/>
    </div>
  );
}