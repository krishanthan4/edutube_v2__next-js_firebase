'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { getCourses, getCategories } from '@/app/lib/firestore';
import { Category, Course } from '@/app/types';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import { 
  FiSearch, 
  FiFilter, 
  FiX,
  FiBookOpen,
  FiUsers,
  FiClock,
  FiShare2
} from 'react-icons/fi';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'videos'>('newest');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Default categories if none exist in Firestore
  const defaultCategories: Category[] = [
    { id: 'web-dev', name: 'Web Development', image: 'https://img.freepik.com/premium-photo/conceptual-image-laptop-with-fire-screengenerative-ai_391052-12821.jpg' },
    { id: 'cybersecurity', name: 'Cybersecurity', image: 'https://akm-img-a-in.tosshub.com/sites/visualstory/stories/2023_03/story_26409/assets/1.jpeg?time=1678872838&size=*:900' },
    { id: 'mobile-dev', name: 'Mobile Development', image: 'https://techrushi.com/wp-content/uploads/2023/01/Ai-Art-Generator-Wallpapers.jpg' },
    { id: 'computer-science', name: 'Computer Science', image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 'backend', name: 'Backend Development', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 'frontend', name: 'Frontend Development', image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const fetchedCategories = await getCategories();
        const categoriesToUse = fetchedCategories.length > 0 ? fetchedCategories : defaultCategories;
        setCategories(categoriesToUse as Category[]);
        
        // Fetch all courses
        const courseData = await getCourses();
        setCourses(courseData as Course[]);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use default categories if fetch fails
        setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort courses
  useEffect(() => {
    let filtered = [...courses];

    // Apply access control filter first
    // Show public courses + user's own private courses
    if (user) {
      filtered = filtered.filter(course => 
        course.isPublic === true || 
        course.createdBy === user.uid || 
        course.userId === user.uid
      );
    } else {
      // Non-authenticated users only see public courses
      filtered = filtered.filter(course => course.isPublic === true);
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(course => course.categoryId === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter public only (additional filter if user wants to see only public courses)
    if (showPublicOnly) {
      filtered = filtered.filter(course => course.isPublic === true);
    }

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt?.toDate() || 0).getTime() - new Date(a.createdAt?.toDate() || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt?.toDate() || 0).getTime() - new Date(b.createdAt?.toDate() || 0).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'videos':
          return (b.videoCount || 0) - (a.videoCount || 0);
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  }, [courses, selectedCategory, searchTerm, sortBy, showPublicOnly, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Loading courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Courses
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing courses created by our community. Learn anything for completely free.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-3 border rounded-lg transition-colors ${
                showFilters 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FiFilter className="w-5 h-5" />
              <span>Filters</span>
              {(selectedCategory || showPublicOnly) && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {(selectedCategory ? 1 : 0) + (showPublicOnly ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title' | 'videos')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Alphabetical</option>
                    <option value="videos">Most Videos</option>
                  </select>
                </div>

                {/* Public Only */}
                <div className="flex flex-col justify-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showPublicOnly}
                      onChange={(e) => setShowPublicOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {user ? 'Show only public courses' : 'Public courses only'}
                    </span>
                  </label>
                  {user && (
                    <span className="text-xs text-gray-500 ml-6">
                      By default, you see public courses + your private courses
                    </span>
                  )}
                </div>
              </div>
              
              {/* Clear Filters */}
              {(selectedCategory || showPublicOnly || searchTerm) && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setShowPublicOnly(false);
                      setSearchTerm('');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
            <span>
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
              {selectedCategory && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
              {searchTerm && ` for "${searchTerm}"`}
            </span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiBookOpen className="w-4 h-4 text-blue-600" />
                <span>{courses.length} total courses</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiUsers className="w-4 h-4 text-green-600" />
                <span>{courses.filter(c => c.isPublic).length} public</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCourses.length === 0 && courses.length > 0 ? (
          <div className="text-center py-12">
            <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No courses match your filters
            </h2>
            <p className="text-gray-600 mb-8">
              Try adjusting your search term or filters to find courses.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setShowPublicOnly(false);
                setSearchTerm('');
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No courses found
            </h2>
            <p className="text-gray-600 mb-8">
              No courses have been created yet.
            </p>
            {user && (
              <Link
                href="/courses/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Your First Course
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
              >
                <Link href={user ? `/courses/${course.id}/viewer` : (course.isPublic ? `/courses/${course.id}/viewer` : `/auth/login`)}>
                  <div className="aspect-w-16 aspect-h-9 relative">
                    <img
                      src={course.thumbnail || '/api/placeholder/400/225'}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
                      draggable="false"
                    />
                    {course.isPublic && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Public
                        </span>
                      </div>
                    )}
                    {user && !course.isPublic && (course.createdBy === user.uid || course.userId === user.uid) && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                          My Private
                        </span>
                      </div>
                    )}
                    {!user && !course.isPublic && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-medium px-3 py-1 bg-blue-600 rounded-full">
                          Sign in to access
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span className="flex items-center space-x-1">
                        <FiBookOpen className="w-3 h-3" />
                        <span>{course.videoCount || 0} lessons</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FiClock className="w-3 h-3" />
                        <span>{new Date(course.createdAt?.toDate() || 0).toLocaleDateString()}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {course.category || categories.find(c => c.id === course.categoryId)?.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        {/* User's own course indicator */}
                        {user && (course.createdBy === user.uid || course.userId === user.uid) && (
                          <span className="text-xs text-blue-600 font-medium">My Course</span>
                        )}
                        {/* Visibility indicator */}
                        {course.isPublic ? (
                          <span className="text-xs text-green-600 font-medium">Public</span>
                        ) : (
                          <span className="text-xs text-orange-600 font-medium">Private</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
                
                {/* Share button for public courses */}
                {course.isPublic && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const shareUrl = `${window.location.origin}/courses/${course.id}/viewer`;
                      if (navigator.share) {
                        navigator.share({
                          title: course.title,
                          text: course.description,
                          url: shareUrl
                        });
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        alert('Course URL copied to clipboard!');
                      }
                    }}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-600 hover:text-blue-600 p-2 rounded-full shadow-md"
                    title="Share this course"
                  >
                    <FiShare2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample Categories for New Users */}
      {!user && filteredCourses.length === 0 && courses.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Explore Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {defaultCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
                    draggable="false"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 text-center">
                    {category.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              Sign up to create and track your learning progress
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}