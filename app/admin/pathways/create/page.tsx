'use client';
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Category, Course, Guidance, PathwayItem } from '../../../../types';
import { useAuth } from '../../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  FiSave, 
  FiPlus,
  FiBookOpen,
  FiFile,
  FiTrash2
} from 'react-icons/fi';

// Dynamically import ReactFlow to avoid SSR issues
const ReactFlow = dynamic(
  () => import('reactflow').then(mod => mod.default),
  { ssr: false }
);

// Import named exports directly
import { Background, Controls, MiniMap } from 'reactflow';

interface CreatePathwayProps {
  params?: Promise<{ id?: string }>;
}

export default function CreatePathway({ params }: CreatePathwayProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [guidances, setGuidances] = useState<Guidance[]>([]);
  const [pathwayItems, setPathwayItems] = useState<PathwayItem[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [pathwayId, setPathwayId] = useState<string>('');
  const [selectedResource, setSelectedResource] = useState<'course' | 'guidance'>('course');
  const [selectedResourceId, setSelectedResourceId] = useState('');
  
  const auth = useAuth();
  const userProfile = (auth as any).userProfile;
  const router = useRouter();

  useEffect(() => {
    loadData();
    checkIfEdit();
  }, []);

  useEffect(() => {
    updateGraphVisualization();
  }, [pathwayItems]);

  const checkIfEdit = async () => {
    if (params) {
      const resolvedParams = await params;
      if (resolvedParams?.id) {
        setIsEdit(true);
        setPathwayId(resolvedParams.id);
        await loadPathway(resolvedParams.id);
      }
    }
  };

  const loadData = async () => {
    try {
      const [categoriesSnapshot, coursesSnapshot, guidancesSnapshot] = await Promise.all([
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'guidances'))
      ]);
      
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
      
      setCategories(categoriesData);
      setCourses(coursesData);
      setGuidances(guidancesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const loadPathway = async (id: string) => {
    try {
      const pathwayDoc = await getDoc(doc(db, 'pathways', id));
      if (pathwayDoc.exists()) {
        const data = pathwayDoc.data();
        setTitle(data.title || '');
        setDescription(data.description || '');
        setCategoryId(data.categoryId || '');
        setPathwayItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to load pathway:', error);
    }
  };

  const updateGraphVisualization = () => {
    const newNodes = pathwayItems.map((item, index) => {
      const resource = item.type === 'course' 
        ? courses.find(c => c.id === item.resourceId)
        : guidances.find(g => g.id === item.resourceId);
      
      return {
        id: item.id,
        type: 'default',
        position: { x: 200 * index, y: 100 * Math.floor(index / 3) },
        data: {
          label: (
            <div className={`p-3 rounded-lg border-2 min-w-[200px] ${
              item.type === 'course' 
                ? 'border-green-400 bg-green-50' 
                : 'border-purple-400 bg-purple-50'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {item.type === 'course' ? (
                  <FiBookOpen className="w-4 h-4 text-green-600" />
                ) : (
                  <FiFile className="w-4 h-4 text-purple-600" />
                )}
                <span className={`text-xs px-2 py-1 rounded ${
                  item.type === 'course' ? 'bg-green-200 text-green-800' : 'bg-purple-200 text-purple-800'
                }`}>
                  {item.type}
                </span>
              </div>
              <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                {item.title || resource?.title || 'Unknown item'}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                Position: {item.position}
              </p>
            </div>
          )
        },
      };
    });

    const newEdges = [];
    for (let i = 0; i < pathwayItems.length - 1; i++) {
      newEdges.push({
        id: `edge-${i}`,
        source: pathwayItems[i].id,
        target: pathwayItems[i + 1].id,
        type: 'smoothstep',
        style: { stroke: '#64748b', strokeWidth: 2 },
        markerEnd: {
          type: 'arrowclosed',
          color: '#64748b',
        },
      });
    }

    // Add dependency edges
    pathwayItems.forEach(item => {
      if (item.dependencies) {
        item.dependencies.forEach(depId => {
          newEdges.push({
            id: `dep-${item.id}-${depId}`,
            source: depId,
            target: item.id,
            type: 'smoothstep',
            style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' },
            markerEnd: {
              type: 'arrowclosed',
              color: '#ef4444',
            },
          });
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const addResourceToPathway = () => {
    if (!selectedResourceId) return;

    const resource = selectedResource === 'course' 
      ? courses.find(c => c.id === selectedResourceId)
      : guidances.find(g => g.id === selectedResourceId);

    if (!resource) return;

    const newItem: PathwayItem = {
      id: `item-${Date.now()}`,
      type: selectedResource,
      resourceId: selectedResourceId,
      position: pathwayItems.length + 1,
      title: resource.title,
      dependencies: []
    };

    setPathwayItems([...pathwayItems, newItem]);
    setSelectedResourceId('');
  };

  const removeItem = (itemId: string) => {
    const updatedItems = pathwayItems
      .filter(item => item.id !== itemId)
      .map((item, index) => ({ ...item, position: index + 1 }));
    
    setPathwayItems(updatedItems);
  };

  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    const currentIndex = pathwayItems.findIndex(item => item.id === itemId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= pathwayItems.length) return;

    const updatedItems = [...pathwayItems];
    [updatedItems[currentIndex], updatedItems[newIndex]] = [updatedItems[newIndex], updatedItems[currentIndex]];
    
    // Update positions
    updatedItems.forEach((item, index) => {
      item.position = index + 1;
    });

    setPathwayItems(updatedItems);
  };

  const handleSave = async () => {
    if (!title || !categoryId || pathwayItems.length === 0 || !userProfile) {
      alert('Please fill in all required fields and add at least one item');
      return;
    }

    setSaving(true);
    try {
      const pathwayData = {
        title,
        description,
        categoryId,
        items: pathwayItems,
        createdBy: userProfile.uid,
        updatedAt: new Date()
      };

      if (isEdit) {
        await updateDoc(doc(db, 'pathways', pathwayId), pathwayData);
      } else {
        await addDoc(collection(db, 'pathways'), {
          ...pathwayData,
          createdAt: new Date()
        });
      }

      router.push('/admin/pathways');
    } catch (error) {
      console.error('Failed to save pathway:', error);
      alert('Failed to save pathway');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Pathway' : 'Create Learning Pathway'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update your learning pathway' : 'Design a structured learning experience'}
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Pathway'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter pathway title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the pathway"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Add Resources */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Resources</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="course"
                      checked={selectedResource === 'course'}
                      onChange={(e) => setSelectedResource(e.target.value as 'course')}
                      className="mr-2"
                    />
                    <FiBookOpen className="w-4 h-4 text-green-600 mr-1" />
                    <span>Course</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="guidance"
                      checked={selectedResource === 'guidance'}
                      onChange={(e) => setSelectedResource(e.target.value as 'guidance')}
                      className="mr-2"
                    />
                    <FiFile className="w-4 h-4 text-purple-600 mr-1" />
                    <span>Guidance</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select {selectedResource}
                </label>
                <select
                  value={selectedResourceId}
                  onChange={(e) => setSelectedResourceId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a {selectedResource}</option>
                  {(selectedResource === 'course' ? courses : guidances).map(resource => (
                    <option key={resource.id} value={resource.id}>
                      {resource.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={addResourceToPathway}
                disabled={!selectedResourceId}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add to Pathway</span>
              </button>
            </div>
          </div>

          {/* Pathway Items List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pathway Items ({pathwayItems.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {pathwayItems.map((item, index) => {
                const resource = item.type === 'course' 
                  ? courses.find(c => c.id === item.resourceId)
                  : guidances.find(g => g.id === item.resourceId);
                
                return (
                  <div key={item.id} className="flex items-center space-x-2 p-2 border border-gray-200 rounded">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center justify-center font-medium">
                      {item.position}
                    </span>
                    {item.type === 'course' ? (
                      <FiBookOpen className="w-4 h-4 text-green-600" />
                    ) : (
                      <FiFile className="w-4 h-4 text-purple-600" />
                    )}
                    <span className="flex-1 text-sm line-clamp-1">
                      {item.title || resource?.title}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => moveItem(item.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveItem(item.id, 'down')}
                        disabled={index === pathwayItems.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {pathwayItems.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No items added yet. Add courses and guidances to build your pathway.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Graph Visualization */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pathway Visualization</h2>
            <div className="h-96 border border-gray-300 rounded-lg overflow-hidden">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                className="bg-gray-50"
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </div>
            <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-green-400 bg-green-50 rounded"></div>
                <span>Course</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-purple-400 bg-purple-50 rounded"></div>
                <span>Guidance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-gray-600"></div>
                <span>Sequential Flow</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-red-500 border-dashed"></div>
                <span>Dependency</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}