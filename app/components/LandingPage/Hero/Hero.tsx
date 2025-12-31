'use client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowRight,
  FiZap,
  FiStar,
  FiPlay,
  FiCheckCircle,
  FiYoutube,
  FiX,
} from 'react-icons/fi';
import { PlatformTransform } from './PlatformTransform';

function Hero({user,stats}:{user:any,stats:any}) {
  return (
    <section className="relative overflow-hidden h-[85vh] flex items-center">
        <div className="absolute inset-0 "></div>
        <div className=" absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Main Message */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Turn <span className="bg-text-red-500 inline-flex justify-center items-center">
                  YouTube Playlist
                </span>
                <br />
                Into {' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-yellow-500">
                  Premium Courses
                </span>
              </h1>
              
              <p className="text-md md:text-xl text-gray-500 mb-8 leading-relaxed">
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
                    className="inline-flex items-center px-8 py-4 border-2 border-black  text-lg font-bold rounded-full hover:bg-black text-black hover:text-white transition-all transform hover:scale-105"
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
                  <div className="text-3xl font-bold text-orange-400 mb-1">100%</div>
                  <div className="text-gray-400 text-sm"> Free for Forever</div>
                </div>
              </div>
            </div>
            
           
                     {/* Right Animation */}
                     <motion.div
                       initial={{ opacity: 0, x: 50 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                       className="relative"
                     >
                       <PlatformTransform />
                     </motion.div>
          </div>
        </div>
      </section>  )
}

export default Hero