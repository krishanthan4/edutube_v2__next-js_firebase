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
import CourseCard from '@/app/components/CourseCard';

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


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const fetchedCategories = await getCategories();
        if(fetchedCategories.length > 0){
        setCategories(fetchedCategories as Category[]);
        }
        
        // Fetch all courses
        const courseData = await getCourses();
        setCourses(courseData as Course[]);
      } catch (error) {
        console.error('Error fetching data:', error);
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
      <div className="min-h-screen ">
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Loading courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ backgroundImage: "url('/background.png')" }}>
     
    {/* Page Header */}
          <div className='py-10'>
              <h1 className="text-3xl text-center md:text-4xl font-bold text-gray-900">
              Explore Courses
            </h1>
          </div>
          

      {/* Search and Filters */}
        <div className="max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2  focus:border-transparent"
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
                  : 'border-gray-200 bg-white text-gray-700 hover:'
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
            <div className=" rounded-lg p-4 space-y-4">
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

        </div>
      </div>
  {/* course category filter list */}
  <div className='flex flex-row items-center mt-3 justify-center gap-2'>
{categories.map((category,index:number)=>{
  if(index < 5){
return (
    <button key={index.toString()} onClick={()=>{setSelectedCategory(category.id)}} className='border hover:cursor-pointer border-black rounded-xl p-2'>{category.name}</button>
  );
  }

})}
  </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
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
            {filteredCourses.map((course,index) => (
              <CourseCard key={index} course={course} user={user}/>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}