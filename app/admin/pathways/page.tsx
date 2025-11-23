'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { GuidancePathway, Category, Course, Guidance } from '../../../types';
import { 
  FiEdit2, 
  FiTrash2, 
  FiSearch, 
  FiPlus,
  FiEye,
  FiMap,
  FiBookOpen,
  FiFile
} from 'react-icons/fi';
import Link from 'next/link';

export default function PathwaysManagement() {
  const [pathways, setPathways] = useState<GuidancePathway[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [guidances, setGuidances] = useState<Guidance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pathwaysSnapshot, categoriesSnapshot, coursesSnapshot, guidancesSnapshot] = await Promise.all([
        getDocs(collection(db, 'pathways')),
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'guidances'))
      ]);
      
      const pathwaysData = pathwaysSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as GuidancePathway));
      
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
      
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course));
      
      const guidancesData = guidancesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Guidance));
      
      setPathways(pathwaysData);
      setCategories(categoriesData);
      setCourses(coursesData);
      setGuidances(guidancesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePathway = async (pathwayId: string) => {
    if (!confirm('Are you sure you want to delete this pathway?')) return;
    
    try {
      const pathwayRef = doc(db, 'pathways', pathwayId);
      await deleteDoc(pathwayRef);
      
      // Update local state
      setPathways(pathways.filter(pathway => pathway.id !== pathwayId));
    } catch (error) {
      console.error('Failed to delete pathway:', error);
    }
  };

  const filteredPathways = pathways.filter(pathway => {
    const matchesSearch = pathway.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pathway.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pathway.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getPathwayStats = (pathway: GuidancePathway) => {
    const courseCount = pathway.items.filter(item => item.type === 'course').length;
    const guidanceCount = pathway.items.filter(item => item.type === 'guidance').length;
    return { courseCount, guidanceCount };
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Learning Pathways</h1>
          <p className="text-gray-600">Create and manage structured learning paths</p>
        </div>
        <Link 
          href="/admin/pathways/create"
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Create Pathway</span>
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
              placeholder="Search pathways..."
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
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FiMap className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{pathways.length}</p>
              <p className="text-gray-600">Total Pathways</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FiBookOpen className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              <p className="text-gray-600">Available Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FiFile className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{guidances.length}</p>
              <p className="text-gray-600">Available Guidances</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FiEye className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {pathways.reduce((total, pathway) => total + pathway.items.length, 0)}
              </p>
              <p className="text-gray-600">Total Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pathways Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Pathways ({filteredPathways.length})
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPathways.map((pathway) => {
              const category = categories.find(c => c.id === pathway.categoryId);
              const stats = getPathwayStats(pathway);
              
              return (
                <div key={pathway.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  {/* Pathway Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                        {pathway.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {category?.name || 'No category'}
                      </p>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {pathway.description}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-green-600">
                          <FiBookOpen className="w-4 h-4 mr-1" />
                          <span>{stats.courseCount} courses</span>
                        </div>
                        <div className="flex items-center text-purple-600">
                          <FiFile className="w-4 h-4 mr-1" />
                          <span>{stats.guidanceCount} guides</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Preview of items */}
                    {pathway.items.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Learning Path Preview
                        </p>
                        <div className="space-y-1">
                          {pathway.items.slice(0, 3).map((item, index) => {
                            const resource = item.type === 'course' 
                              ? courses.find(c => c.id === item.resourceId)
                              : guidances.find(g => g.id === item.resourceId);
                            
                            return (
                              <div key={item.id} className="flex items-center text-xs text-gray-600">
                                <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center mr-2 text-[10px] font-medium">
                                  {index + 1}
                                </span>
                                <span className={`w-2 h-2 rounded-full mr-2 ${item.type === 'course' ? 'bg-green-400' : 'bg-purple-400'}`}></span>
                                <span className="line-clamp-1">
                                  {item.title || resource?.title || 'Unknown item'}
                                </span>
                              </div>
                            );
                          })}
                          {pathway.items.length > 3 && (
                            <p className="text-xs text-gray-500 ml-6">
                              +{pathway.items.length - 3} more items
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <Link
                          href={`/pathways/${pathway.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View pathway"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/pathways/edit/${pathway.id}`}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Edit pathway"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                      </div>
                      <button
                        onClick={() => deletePathway(pathway.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete pathway"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredPathways.length === 0 && (
            <div className="text-center py-12">
              <FiMap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pathways found matching your criteria.</p>
              <Link 
                href="/admin/pathways/create"
                className="inline-flex items-center space-x-2 mt-4 text-blue-600 hover:text-blue-800"
              >
                <FiPlus className="w-4 h-4" />
                <span>Create your first pathway</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}