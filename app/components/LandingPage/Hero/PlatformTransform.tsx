import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { 
  Play, 
  Clock, 
  Star, 
  CheckCircle2, 
  Zap
} from "lucide-react";

export const PlatformTransform = () => {
  const [showPremium, setShowPremium] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowPremium((prev) => !prev);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const youtubeVideos = [
    { id: 1, title: "Introduction to React", duration: "12:30" },
    { id: 2, title: "State Management", duration: "18:45" },
    { id: 3, title: "React Hooks Deep Dive", duration: "25:12" },
    { id: 4, title: "Building Components", duration: "15:20" }
  ];

  const premiumLessons = [
    { id: 1, title: "Introduction to React", duration: "12:30", completed: true, progress: 100 },
    { id: 2, title: "State Management", duration: "18:45", completed: true, progress: 100 },
    { id: 3, title: "React Hooks Deep Dive", duration: "25:12", completed: false, progress: 65 },
    { id: 4, title: "Building Components", duration: "15:20", completed: false, progress: 0 }
  ];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Main Container */}
      <div className="relative h-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <AnimatePresence mode="wait">
          {!showPremium ? (
            // YouTube Playlist View
            <motion.div
              key="youtube"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 p-4 bg-gray-50"
            >
              {/* YouTube Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Youtube Playlist</h3>
                  <p className="text-xs text-gray-500">4 videos</p>
                </div>
              </div>

              {/* YouTube Video List */}
              <div className="space-y-3">
                {youtubeVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    <div className="w-12 h-9 bg-gray-200 rounded flex items-center justify-center shrink-0">
                      <Play className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-gray-900 truncate">{video.title}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{video.duration}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* No Progress Message */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                  <p className="text-xs text-red-600 font-medium">❌ No progress tracking</p>
                </div>
              </div>
            </motion.div>
          ) : (
            // Premium Course Platform View
            <motion.div
              key="premium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 p-4"
              style={{
                background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fb923c 100%)'
              }}
            >
              {/* Premium Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-orange-300">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Premium Course</h3>
                  <p className="text-xs text-orange-700 font-medium">75% Complete</p>
                </div>
              </div>

              {/* Premium Lesson List */}
              <div className="space-y-3">
                {premiumLessons.map((lesson, index) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-2 bg-white/60 rounded-lg backdrop-blur-sm"
                  >
                    <div className="relative w-12 h-9 bg-orange-100 border border-orange-300 rounded flex items-center justify-center shrink-0">
                      <Play className="w-3 h-3 text-orange-600" />
                      {lesson.completed && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-gray-900 truncate">{lesson.title}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>{lesson.duration}</span>
                        {lesson.completed && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-green-600 font-medium">✓</span>
                          </>
                        )}
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <motion.div
                          className="bg-orange-500 h-1 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${lesson.progress}%` }}
                          transition={{ duration: 0.8, delay: index * 0.2 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Progress Summary */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-green-50 border border-green-300 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <p className="text-xs text-green-700 font-medium">75% Complete • 3 day streak!</p>
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transformation Wipe Effect */}
        <AnimatePresence>
          {showPremium && (
            <motion.div
              initial={{ x: '-100%', skewX: -12 }}
              animate={{ x: '100%', skewX: -12 }}
              exit={{ x: '100%', skewX: -12 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 bg-linear-to-r from-orange-400 via-yellow-400 to-orange-500"
              style={{ transformOrigin: "left center" }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Transformation Labels */}
      <motion.div 
        className="text-center mt-6"
        animate={{ 
          scale: showPremium ? 1.02 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.h3 
          className="text-lg font-bold mb-2"
          animate={{ 
            color: showPremium ? '#ea580c' : '#dc2626'
          }}
        >
          {showPremium ? "🎯 Premium Course Platform" : "📺 YouTube Playlist"}
        </motion.h3>
        <motion.p 
          className="text-sm text-gray-600"
          animate={{ opacity: 1 }}
        >
          {showPremium 
            ? "Structured Learning • Progress Tracking • Gamified Experience" 
            : "Scattered Videos • No Progress • Basic Watching"
          }
        </motion.p>
      </motion.div>
    </div>
  );
};

