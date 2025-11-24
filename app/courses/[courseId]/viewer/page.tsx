'use client';
import { useState, useEffect, use } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { getCourse, getUserProgress, createUserProgress } from '../../../../lib/firestore';
import { Course, Video, UserProgress } from '../../../../types';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';

interface CourseViewerProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default function CourseViewer({ params }: CourseViewerProps) {
  const resolvedParams = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        
        const courseData = await getCourse(resolvedParams.courseId);
        setCourse(courseData as Course);
        
        if (user) {
          const progressData = await getUserProgress(user.uid, resolvedParams.courseId);
          setUserProgress(progressData as UserProgress[]);
        }
        
      } catch (error) {
        setError('Failed to load course data');
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [resolvedParams.courseId, user]);

  const getCompletedVideosCount = () => {
    return userProgress.length;
  };

  const getProgressPercentage = () => {
    if (!course || !course.videos) return 0;
    return Math.floor((getCompletedVideosCount() / course.videos.length) * 100);
  };

  const isVideoCompleted = (videoId: string) => {
    return userProgress.some(progress => progress.videoId === videoId);
  };

  const handleCompleteVideo = async () => {
    console.log('Complete button clicked');
    console.log('User:', user);
    console.log('Course:', course);
    console.log('Current video index:', currentVideoIndex);
    
    if (!user || !course || !course.videos) {
      console.log('Missing required data:', { user: !!user, course: !!course, videos: !!course?.videos });
      return;
    }
    
    const currentVideo = course.videos[currentVideoIndex];
    if (!currentVideo || isVideoCompleted(currentVideo.id)) {
      console.log('Video already completed or not found:', { currentVideo: !!currentVideo, completed: isVideoCompleted(currentVideo?.id || '') });
      return;
    }

    try {
      console.log('Creating user progress for video:', currentVideo.id);
      await createUserProgress(user.uid, resolvedParams.courseId, currentVideo.id);
      console.log('User progress created successfully');
      
      // Update local state
      const newProgress: UserProgress = {
        id: '',
        userId: user.uid,
        courseId: resolvedParams.courseId,
        videoId: currentVideo.id,
        completed: true,
        completedAt: new Date()
      };
      setUserProgress([...userProgress, newProgress]);
      console.log('Local progress updated');
      
      // Auto-advance to next video if not last
      if (currentVideoIndex < course.videos.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
        console.log('Advanced to next video');
      }
    } catch (error) {
      console.error('Error marking video as complete:', error);
      alert('Failed to mark video as complete. Please try again.');
    }
  };

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const handleVideoClick = (index: number) => {
    setCurrentVideoIndex(index);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const goHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Loading course...</div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-xl text-red-600 mb-4">{error || 'Course not found'}</div>
            <button
              onClick={goHome}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course.videos || course.videos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-xl text-gray-600 mb-4">No videos available for this course</div>
            <button
              onClick={goHome}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentVideo = course.videos[currentVideoIndex];

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`${sidebarVisible ? 'block' : 'hidden'} md:w-2/4 lg:w-1/4 h-screen pb-1 overflow-y-scroll bg-white`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#888 #f1f1f1'
        }}
      >
        {/* Course Title */}
        <h2 className="text-lg text-center w-full text-white font-semibold py-3 bg-black sticky top-0 z-10">
          {course.title}
        </h2>

        {/* Progress Bar */}
        <div className="w-full mt-12">
          <div className="text-lg text-center w-full py-2 bg-gray-200 text-black font-semibold uppercase">
            {getProgressPercentage()}% Complete
          </div>
          <div className="mx-2 bg-gray-200 h-3 rounded-sm">
            <div 
              className="bg-black h-3 rounded-sm transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Video List */}
        <ul className="space-y-2 mt-6 px-1">
          {course.videos.map((video, index) => (
            <li
              key={video.id}
              className={`cursor-pointer text-black hover:bg-gray-400 text-md border py-2 px-1 bg-slate-100 border-slate-200 ${
                index === currentVideoIndex ? 'bg-gray-300' : ''
              }`}
              onClick={() => handleVideoClick(index)}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isVideoCompleted(video.id)}
                  onChange={() => {}}
                  disabled
                  className="mr-2"
                />
                <span className="flex-1">{video.title}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className={`${sidebarVisible ? 'lg:w-3/4 md:w-2/4' : 'w-full'} bg-gray-200 h-screen overflow-y-scroll transition-all duration-300`}>
        {/* Navigation Bar */}
        <div className="mb-1 py-2 flex flex-row justify-end bg-black">
          <button
            onClick={goHome}
            className="py-1 px-3 border rounded-lg border-white hover:text-slate-700 me-4 text-white hover:bg-white"
          >
            🏡 Home
          </button>
          <button
            onClick={handlePreviousVideo}
            disabled={currentVideoIndex === 0}
            className="py-1 px-3 border rounded-lg border-white me-4 text-white hover:bg-slate-900 disabled:opacity-50"
          >
            &lt; Previous Lesson
          </button>
          <button
            onClick={handleCompleteVideo}
            disabled={!user || isVideoCompleted(currentVideo.id)}
            className="py-1 px-3 border rounded-lg border-white me-4 text-white hover:bg-slate-900 disabled:opacity-50"
          >
            Complete and Continue &gt;
          </button>
          <button
            onClick={toggleSidebar}
            className="py-1 px-3 border rounded-lg border-white me-4 text-white hover:bg-slate-900"
          >
            Toggle Sidebar
          </button>
        </div>

        {/* Video Player */}
        <div className="w-full p-4 mt-2">
          <iframe
            src={`https://www.youtube.com/embed/${currentVideo.id}?modestbranding=1&rel=0&autoplay=1`}
            height="600"
            className="w-full"
            frameBorder="0"
            allowFullScreen
            title={currentVideo.title}
          />
        </div>

        {/* Bottom Complete Button */}
        <div className="flex flex-col items-center w-full py-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log('Button click event triggered');
              handleCompleteVideo();
            }}
            disabled={!user || isVideoCompleted(currentVideo.id)}
            className={`py-3 px-6 rounded-lg font-medium transition-colors ${
              !user || isVideoCompleted(currentVideo.id)
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-50'
                : 'bg-black text-white hover:bg-gray-800 cursor-pointer'
            }`}
          >
            {isVideoCompleted(currentVideo.id) 
              ? 'Completed ✓' 
              : 'Complete and Continue >'}
          </button>
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {currentVideo.title}
          </h3>
          {currentVideo.description && (
            <p className="text-gray-600">
              {currentVideo.description}
            </p>
          )}
        </div>

        {!user && (
          <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 mx-4 rounded">
            <p className="text-center">
              Sign in to track your progress and save your learning journey!
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        /* Custom scrollbar styles */
        .overflow-y-scroll::-webkit-scrollbar {
          width: 12px;
        }
        .overflow-y-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .overflow-y-scroll::-webkit-scrollbar-thumb {
          background-color: #888;
          border-radius: 6px;
          border: 3px solid #f1f1f1;
        }
        .overflow-y-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #555;
        }
      `}</style>
    </div>
  );
}