'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../../lib/firebase';
import { Category } from '../../../../types';
import { useAuth } from '../../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  FiSave, 
  FiUpload,
  FiImage,
  FiPlus,
  FiX
} from 'react-icons/fi';

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

interface CreateGuidanceProps {
  params?: Promise<{ id?: string }>;
}

export default function CreateGuidance({ params }: CreateGuidanceProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('# Your Guidance Title\n\nStart writing your guidance here...');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [guidanceId, setGuidanceId] = useState<string>('');
  
  const auth = useAuth();
  const userProfile = (auth as any).userProfile;
  const router = useRouter();

  useEffect(() => {
    loadCategories();
    checkIfEdit();
  }, []);

  const checkIfEdit = async () => {
    if (params) {
      const resolvedParams = await params;
      if (resolvedParams?.id) {
        setIsEdit(true);
        setGuidanceId(resolvedParams.id);
        await loadGuidance(resolvedParams.id);
      }
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadGuidance = async (id: string) => {
    try {
      const guidanceDoc = await getDoc(doc(db, 'guidances', id));
      if (guidanceDoc.exists()) {
        const data = guidanceDoc.data();
        setTitle(data.title || '');
        setDescription(data.description || '');
        setContent(data.content || '');
        setCategoryId(data.categoryId || '');
        setTags(data.tags || []);
        setThumbnail(data.thumbnail || '');
      }
    } catch (error) {
      console.error('Failed to load guidance:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return '';
    
    setUploading(true);
    try {
      // Create organized path structure
      const fileName = `${Date.now()}_${file.name}`;
      const imagePath = `guidances/images/${fileName}`;
      const imageRef = ref(storage, imagePath);
      
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Failed to upload image:', error);
      return '';
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = await handleImageUpload(file);
      if (url) {
        setThumbnail(url);
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title || !content || !categoryId || !userProfile) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const guidanceData = {
        title,
        description,
        content,
        categoryId,
        tags,
        thumbnail,
        createdBy: userProfile.uid,
        updatedAt: new Date()
      };

      if (isEdit) {
        await updateDoc(doc(db, 'guidances', guidanceId), guidanceData);
      } else {
        await addDoc(collection(db, 'guidances'), {
          ...guidanceData,
          createdAt: new Date()
        });
      }

      router.push('/admin/guidances');
    } catch (error) {
      console.error('Failed to save guidance:', error);
      alert('Failed to save guidance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Guidance' : 'Create Guidance'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update your guidance content' : 'Create a comprehensive learning guidance'}
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
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Guidance'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter guidance title"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description of the guidance"
                />
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content *</h2>
            <div className="markdown-editor-container">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                preview="edit"
                hideToolbar={false}
                textareaProps={{
                  placeholder: 'Write your guidance content in Markdown...'
                }}
                height={400}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Use Markdown to format your content. You can add headings, lists, code blocks, and more.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category *</h3>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Thumbnail */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thumbnail</h3>
            {thumbnail && (
              <div className="mb-4">
                <img 
                  src={thumbnail} 
                  alt="Thumbnail"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
            <label className="flex items-center justify-center w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <FiImage className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'Upload Thumbnail'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Add a tag"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}