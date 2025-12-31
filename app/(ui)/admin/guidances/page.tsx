'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Guidance, Category } from '@/app/types';
import { 
  FiEdit2, 
  FiTrash2, 
  FiSearch, 
  FiPlus,
  FiEye,
  FiFile,
  FiFolder
} from 'react-icons/fi';
import Link from 'next/link';

export default function GuidancesManagement() {
  const [guidances, setGuidances] = useState<Guidance[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [guidancesSnapshot, categoriesSnapshot] = await Promise.all([
        getDocs(collection(db, 'guidances')),
        getDocs(collection(db, 'categories'))
      ]);
      
      const guidancesData = guidancesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Guidance));
      
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
      
      setGuidances(guidancesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteGuidance = async (guidanceId: string) => {
    if (!confirm('Are you sure you want to delete this guidance?')) return;
    
    try {
      const guidanceRef = doc(db, 'guidances', guidanceId);
      await deleteDoc(guidanceRef);
      
      // Update local state
      setGuidances(guidances.filter(guidance => guidance.id !== guidanceId));
    } catch (error) {
      console.error('Failed to delete guidance:', error);
    }
  };

  const filteredGuidances = guidances.filter(guidance => {
    const matchesSearch = guidance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guidance.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guidance.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || guidance.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
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
          <h1 className="text-3xl font-bold text-gray-900">Guidances Management</h1>
          <p className="text-gray-600">Create and manage learning guidances</p>
        </div>
        <Link 
          href="/admin/guidances/create"
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Create Guidance</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search guidances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FiFile className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{guidances.length}</p>
              <p className="text-gray-600">Total Guidances</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FiFolder className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              <p className="text-gray-600">Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FiEye className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-gray-600">Total Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guidances Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Guidances ({filteredGuidances.length})
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuidances.map((guidance) => {
              const category = categories.find(c => c.id === guidance.categoryId);
              
              return (
                <div key={guidance.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Guidance Thumbnail */}
                  {guidance.thumbnail && (
                    <img 
                      src={guidance.thumbnail} 
                      alt={guidance.title}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  {/* Guidance Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {guidance.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {guidance.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{category?.name || 'No category'}</span>
                      <span>{new Date(guidance.createdAt?.toDate()).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Tags */}
                    {guidance.tags && guidance.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {guidance.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {guidance.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{guidance.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <Link
                          href={`/guidances/${guidance.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View guidance"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/guidances/edit/${guidance.id}`}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Edit guidance"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                      </div>
                      <button
                        onClick={() => deleteGuidance(guidance.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete guidance"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredGuidances.length === 0 && (
            <div className="text-center py-12">
              <FiFile className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No guidances found matching your criteria.</p>
              <Link 
                href="/admin/guidances/create"
                className="inline-flex items-center space-x-2 mt-4 text-purple-600 hover:text-purple-800"
              >
                <FiPlus className="w-4 h-4" />
                <span>Create your first guidance</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}