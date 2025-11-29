'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Course, User, UserProgress } from '@/app/types';
import Navbar from '@/app/components/Navbar';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ActivityCalendar from '@/app/components/ActivityCalendar';
import Link from 'next/link';
import { 
  FiUser, 
  FiBookOpen, 
  FiTrendingUp, 
  FiClock, 
  FiAward,
  FiCalendar,
  FiEye,
  FiEdit3,
  FiShare2,
  FiPlay,
  FiCheck,
  FiTarget,
  FiActivity
} from 'react-icons/fi';

interface ProfileStats {
  totalCourses: number;
  completedCourses: number;
  totalWatchTime: number;
  currentStreak: number;
  totalGuidances: number;
  createdCourses: number;
}

export default function Profile() {
  const { user, userProfile } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({
    totalCourses: 0,
    completedCourses: 0,
    totalWatchTime: 0,
    currentStreak: 0,
    totalGuidances: 0,
    createdCourses: 0
  });
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && userProfile) {
      fetchUserData();
    }
  }, [user, userProfile]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch user's created courses
      const createdCoursesQuery = query(
        collection(db, 'courses'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(6)
      );
      const createdCoursesSnapshot = await getDocs(createdCoursesQuery);
      const createdCoursesData = createdCoursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];

      // Fetch user's progress
      const progressQuery = query(
        collection(db, 'userProgress'),
        where('userId', '==', user.uid),
        orderBy('lastWatched', 'desc'),
        limit(6)
      );
      const progressSnapshot = await getDocs(progressQuery);
      const progressData = progressSnapshot.docs.map(doc => doc.data()) as UserProgress[];

      // Fetch recent courses user has watched
      const courseIds = progressData.map(p => p.courseId);
      let recentCoursesData: Course[] = [];
      
      if (courseIds.length > 0) {
        for (const courseId of courseIds) {
          const courseQuery = query(collection(db, 'courses'), where('__name__', '==', courseId));
          const courseSnapshot = await getDocs(courseQuery);
          if (!courseSnapshot.empty) {
            const courseData = { id: courseSnapshot.docs[0].id, ...courseSnapshot.docs[0].data() } as Course;
            recentCoursesData.push(courseData);
          }
        }
      }

      // Calculate stats
      const totalCreatedCourses = createdCoursesSnapshot.size;
      const completedCourses = progressData.filter(p => p.completed).length;
      const totalWatchTime = progressData.reduce((total, p) => total + (p.totalWatchTime || 0), 0);

      setStats({
        totalCourses: progressData.length,
        completedCourses,
        totalWatchTime,
        currentStreak: userProfile?.currentStreak || 0,
        totalGuidances: userProfile?.completedGuidances || 0,
        createdCourses: totalCreatedCourses
      });

      setRecentCourses(recentCoursesData.slice(0, 6));
      setCreatedCourses(createdCoursesData);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                  {userProfile.photoURL ? (
                    <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FiUser className="w-8 h-8" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-grow">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {userProfile.displayName || user.displayName || 'Anonymous User'}
                </h1>
                <p className="text-gray-600 mb-2">{user.email}</p>
                {userProfile.bio && (
                  <p className="text-gray-700 mb-3">{userProfile.bio}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <FiCalendar className="w-4 h-4 mr-1" />
                    Joined {new Date(userProfile.createdAt?.toDate() || 0).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <FiEye className="w-4 h-4 mr-1" />
                    {userProfile.profileViews || 0} profile views
                  </span>
                  <span className="capitalize px-2 py-1 text-xs bg-gray-100 rounded-full">
                    {userProfile.role}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Link
                  href="/settings"
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Link>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  <FiShare2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Courses Taken</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                </div>
                <FiBookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedCourses}</p>
                </div>
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Watch Time</p>
                  <p className="text-2xl font-bold text-purple-600">{formatWatchTime(stats.totalWatchTime)}</p>
                </div>
                <FiClock className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.currentStreak}</p>
                </div>
                <FiActivity className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Guidances</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.totalGuidances}</p>
                </div>
                <FiTarget className="w-8 h-8 text-indigo-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Created Courses</p>
                  <p className="text-2xl font-bold text-red-600">{stats.createdCourses}</p>
                </div>
                <FiAward className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Activity Calendar */}
          <ActivityCalendar userId={user.uid} className="mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Learning */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiTrendingUp className="mr-2" />
                  Recent Learning
                </h2>
              </div>
              <div className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex space-x-3">
                          <div className="w-16 h-12 bg-gray-200 rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentCourses.length > 0 ? (
                  <div className="space-y-4">
                    {recentCourses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}/viewer`}
                        className="block group hover:bg-gray-50 p-3 rounded-md transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={course.thumbnail || '/api/placeholder/64/48'}
                            alt={course.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">
                              {course.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {course.videoCount || 0} lessons
                            </p>
                          </div>
                          <FiPlay className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiBookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No courses yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Start learning by exploring available courses.</p>
                    <Link
                      href="/"
                      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Explore Courses
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Created Courses */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiAward className="mr-2" />
                  My Courses
                </h2>
              </div>
              <div className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex space-x-3">
                          <div className="w-16 h-12 bg-gray-200 rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : createdCourses.length > 0 ? (
                  <div className="space-y-4">
                    {createdCourses.map((course) => (
                      <div
                        key={course.id}
                        className="group hover:bg-gray-50 p-3 rounded-md transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={course.thumbnail || '/api/placeholder/64/48'}
                            alt={course.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {course.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span>{course.videoCount || 0} lessons</span>
                              <span>{course.isPublic ? 'Public' : 'Private'}</span>
                              <span>{new Date(course.createdAt?.toDate() || 0).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Link
                            href={`/courses/${course.id}/edit`}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-all"
                          >
                            <FiEdit3 className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiAward className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No courses created</h3>
                    <p className="mt-1 text-sm text-gray-500">Share your knowledge by creating a course.</p>
                    <Link
                      href="/courses/create"
                      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Create Course
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}