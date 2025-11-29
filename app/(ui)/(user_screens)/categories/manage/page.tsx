'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { createCategory, getCategories } from '@/app/lib/firestore';
import { Category } from '@/app/types';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { HiPlus, HiTrash } from 'react-icons/hi';

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    loadCategories();
  }, [user, router]);

  const loadCategories = async () => {
    try {
      const categoryData = await getCategories();
      setCategories(categoryData as Category[]);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
      setError('A category with this name already exists');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const categoryData = {
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
        image: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80` // Default image
      };

      await createCategory(categoryData);
      
      setNewCategoryName('');
      setNewCategoryDescription('');
      setSuccess('Category created successfully!');
      
      // Reload categories
      await loadCategories();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      setError('Failed to create category. Please try again.');
      console.error('Error creating category:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Please log in to manage categories</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Categories</h1>
          
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

          {/* Create New Category Form */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Category</h2>
            
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                  Category Name *
                </label>
                <input
                  id="categoryName"
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                  placeholder="e.g., Machine Learning, Data Science"
                  required
                />
              </div>

              <div>
                <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  id="categoryDescription"
                  rows={3}
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                  placeholder="Brief description of this category"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                <HiPlus className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Add Category'}
              </button>
            </form>
          </div>

          {/* Existing Categories */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Existing Categories</h2>
            
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No categories found. Create your first category above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                      {/* Note: Delete functionality would be implemented here */}
                      <button
                        className="ml-2 p-1 text-gray-400 hover:text-red-600"
                        title="Delete category"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      ID: {category.id}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}