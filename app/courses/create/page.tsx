'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { createCourse, getCategories, fetchPlaylistData } from '../../../lib/firestore';
import { Category } from '../../../types';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function CreateCourse() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingPlaylist, setFetchingPlaylist] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const loadCategories = async () => {
      try {
        const categoryData = await getCategories();
        setCategories(categoryData as Category[]);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, [user, router]);

  const handleFetchPlaylistData = async () => {
    if (!playlistUrl) {
      setError('Please enter a YouTube playlist URL');
      return;
    }

    try {
      setFetchingPlaylist(true);
      setError('');
      
      const playlistData = await fetchPlaylistData(playlistUrl);
      setTitle(playlistData.title);
      setDescription(playlistData.description);
      setSuccess('Playlist data fetched successfully!');
    } catch (error) {
      setError('Failed to fetch playlist data. Please check the URL and try again.');
      console.error('Error fetching playlist:', error);
    } finally {
      setFetchingPlaylist(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !playlistUrl || !categoryId) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a course');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Fetch playlist data to get video count
      const playlistData = await fetchPlaylistData(playlistUrl);
      
      const courseData = {
        title,
        description: description || playlistData.description,
        playlistUrl,
        categoryId,
        thumbnail: playlistData.thumbnail,
        videoCount: playlistData.videos.length,
        videos: playlistData.videos,
        createdBy: user.uid,
        category: categories.find(cat => cat.id === categoryId)?.name || '',
        isPublic: isPublic
      };

      const courseId = await createCourse(courseData);
      setSuccess('Course created successfully!');
      
      // Redirect to the course viewer after 2 seconds
      setTimeout(() => {
        router.push(`/courses/${courseId}/viewer`);
      }, 2000);
      
    } catch (error) {
      setError('Failed to create course. Please try again.');
      console.error('Error creating course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Please log in to create courses</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Course</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="playlistUrl" className="block text-sm font-medium text-gray-700">
                YouTube Playlist URL *
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  id="playlistUrl"
                  type="url"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-black focus:border-black"
                  placeholder="https://youtube.com/playlist?list=..."
                  required
                />
                <button
                  type="button"
                  onClick={handleFetchPlaylistData}
                  disabled={fetchingPlaylist}
                  className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-black focus:border-black disabled:opacity-50"
                >
                  {fetchingPlaylist ? 'Fetching...' : 'Fetch Data'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Enter a YouTube playlist URL to automatically fetch course details
              </p>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Course Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                placeholder="Enter course title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Course Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                placeholder="Enter course description"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  No categories available.{' '}
                  <Link href="/categories/manage" className="text-black hover:text-gray-800">
                    Create categories first
                  </Link>
                </p>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center">
                <input
                  id="isPublic"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-3 block text-sm font-medium text-gray-700">
                  Make this course public
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Public courses can be viewed by anyone without signing in. Private courses require authentication.
                {isPublic && (
                  <span className="block mt-1 text-green-700 font-medium">
                    ✓ This course will be accessible via shareable public URLs
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-between pt-6">
              <Link
                href="/"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || categories.length === 0}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}