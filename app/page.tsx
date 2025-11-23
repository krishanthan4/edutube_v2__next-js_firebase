'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCourses, getCategories } from '../lib/firestore';
import { Category, Course } from '../types';
import Navbar from './components/Navbar';
import Link from 'next/link';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
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
        
        // Fetch courses
        const courseData = selectedCategory 
          ? await getCourses(selectedCategory) 
          : await getCourses();
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
  }, [selectedCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">EduTube</h1>
          <p className="text-lg md:text-xl">Learn Anything For Completely Free</p>
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="bg-white py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleCategoryClick('')}
              className={`px-4 py-2 rounded-md border ${
                selectedCategory === '' 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`px-4 py-2 rounded-md border ${
                  selectedCategory === category.id 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No courses found
            </h2>
            <p className="text-gray-600 mb-8">
              {selectedCategory 
                ? "No courses available in this category yet." 
                : "No courses have been created yet."}
            </p>
            {user && (
              <Link
                href="/courses/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800"
              >
                Create Your First Course
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                <Link href={`/courses/${course.id}/viewer`}>
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={course.thumbnail || '/api/placeholder/400/225'}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-md group-hover:scale-105 transition-transform duration-200"
                      draggable="false"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {course.videoCount || 0} lessons
                      </span>
                      <span className="text-xs text-gray-500">
                        {course.category}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample Categories for New Users */}
      {!user && courses.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Explore Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {defaultCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover rounded-t-md group-hover:scale-105 transition-transform duration-200"
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
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}