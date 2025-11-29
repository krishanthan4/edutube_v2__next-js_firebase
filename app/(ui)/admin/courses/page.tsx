'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Course, Category } from '@/app/types';
import { 
  FiEdit2, 
  FiTrash2, 
  FiSearch, 
  FiFilter,
  FiEye,
  FiUsers,
  FiPlay
} from 'react-icons/fi';
import Link from 'next/link';

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVisibility, setSelectedVisibility] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesSnapshot, categoriesSnapshot] = await Promise.all([
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'categories'))
      ]);
      
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course));
      
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
      
      setCourses(coursesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseVisibility = async (courseId: string, currentVisibility: boolean) => {
    try {
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, { isPublic: !currentVisibility });
      
      // Update local state
      setCourses(courses.map(course => 
        course.id === courseId 
          ? { ...course, isPublic: !currentVisibility }
          : course
      ));
    } catch (error) {
      console.error('Failed to update course visibility:', error);
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const courseRef = doc(db, 'courses', courseId);
      await deleteDoc(courseRef);
      
      // Update local state
      setCourses(courses.filter(course => course.id !== courseId));
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.categoryId === selectedCategory;
    const matchesVisibility = selectedVisibility === 'all' || 
                             (selectedVisibility === 'public' && course.isPublic) ||
                             (selectedVisibility === 'private' && !course.isPublic);
    
    return matchesSearch && matchesCategory && matchesVisibility;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses Management</h1>
          <p className="text-gray-600">Manage all courses on the platform</p>
        </div>
        <Link 
          href="/courses/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Course
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility Filter */}
          <div>
            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value as 'all' | 'public' | 'private')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FiPlay className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              <p className="text-gray-600">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FiEye className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {courses.filter(c => c.isPublic).length}
              </p>
              <p className="text-gray-600">Public</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FiUsers className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {courses.filter(c => !c.isPublic).length}
              </p>
              <p className="text-gray-600">Private</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FiFilter className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              <p className="text-gray-600">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Courses ({filteredCourses.length})
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const category = categories.find(c => c.id === course.categoryId);
              
              return (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Course Thumbnail */}
                  {course.thumbnail && (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  {/* Course Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {course.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        course.isPublic 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{category?.name || 'No category'}</span>
                      <span>{course.videoCount || 0} videos</span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <Link
                          href={`/courses/${course.id}/viewer`}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View course"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => toggleCourseVisibility(course.id, course.isPublic || false)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title={`Make ${course.isPublic ? 'private' : 'public'}`}
                        >
                          <FiUsers className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete course"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <FiPlay className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No courses found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}