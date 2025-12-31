'use client';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FiArrowLeft,
  FiClock,
  FiUser,
  FiTag,
  FiStar,
  FiBookOpen,
  FiCalendar,
  FiEye,
  FiShare2,
  FiBookmark,
  FiHeart
} from 'react-icons/fi';

interface Guidance {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: any;
  updatedAt: any;
  readTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  featured: boolean;
  rating?: number;
  views?: number;
  imageUrl?: string;
  tableOfContents?: string[];
}

export default function GuidanceDetailPage() {
  const params = useParams();
  const guidanceId = params.id as string;
  const [guidance, setGuidance] = useState<Guidance | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (guidanceId) {
      fetchGuidance();
    }
  }, [guidanceId]);

  const fetchGuidance = async () => {
    try {
      setLoading(true);
      const guidanceRef = doc(db, 'guidances', guidanceId);
      const guidanceDoc = await getDoc(guidanceRef);
      
      if (guidanceDoc.exists()) {
        const guidanceData = { id: guidanceDoc.id, ...guidanceDoc.data() } as Guidance;
        setGuidance(guidanceData);
      }
    } catch (error) {
      console.error('Error fetching guidance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: guidance?.title,
          text: guidance?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Loading guidance...</div>
        </div>
      </div>
    );
  }

  if (!guidance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Guidance Not Found</h1>
          <p className="text-gray-600 mb-6">The guidance you're looking for doesn't exist.</p>
          <Link 
            href="/guides"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Guides
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/guides"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back to Guides
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(guidance.difficulty)}`}>
                  {guidance.difficulty.charAt(0).toUpperCase() + guidance.difficulty.slice(1)}
                </span>
                <span className="text-gray-600 text-sm">{guidance.category}</span>
                {guidance.featured && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                    FEATURED
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {guidance.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6">
                {guidance.description}
              </p>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <FiUser className="w-4 h-4 mr-2" />
                  <span>{guidance.author}</span>
                </div>
                <div className="flex items-center">
                  <FiClock className="w-4 h-4 mr-2" />
                  <span>{guidance.readTime} min read</span>
                </div>
                <div className="flex items-center">
                  <FiCalendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(guidance.createdAt)}</span>
                </div>
                {guidance.views && (
                  <div className="flex items-center">
                    <FiEye className="w-4 h-4 mr-2" />
                    <span>{guidance.views.toLocaleString()} views</span>
                  </div>
                )}
                {guidance.rating && (
                  <div className="flex items-center">
                    <FiStar className="w-4 h-4 mr-2 text-yellow-400" />
                    <span>{guidance.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-6">
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className={`p-2 rounded-lg transition-colors ${
                  bookmarked 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiBookmark className="w-5 h-5" />
              </button>
              <button
                onClick={() => setLiked(!liked)}
                className={`p-2 rounded-lg transition-colors ${
                  liked 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiHeart className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <FiShare2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Image */}
            {guidance.imageUrl && (
              <div className="mb-8">
                <img 
                  src={guidance.imageUrl} 
                  alt={guidance.title}
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: guidance.content || '<p>Content not available.</p>' 
                }}
              />
            </div>

            {/* Tags */}
            {guidance.tags && guidance.tags.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {guidance.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                    >
                      <FiTag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Table of Contents */}
              {guidance.tableOfContents && guidance.tableOfContents.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
                  <nav className="space-y-2">
                    {guidance.tableOfContents.map((item, index) => (
                      <a
                        key={index}
                        href={`#section-${index}`}
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors py-1"
                      >
                        {item}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Author Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Author</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{guidance.author}</div>
                    <div className="text-sm text-gray-600">Content Expert</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Expert in {guidance.category} with years of experience in creating educational content.
                </p>
              </div>

              {/* Reading Progress */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reading Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Estimated reading time</span>
                    <span>{guidance.readTime} minutes</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <p className="text-xs text-gray-600">
                    Track your reading progress as you scroll through the article.
                  </p>
                </div>
              </div>

              {/* Related Category */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3>
                <Link 
                  href={`/guides?category=${encodeURIComponent(guidance.category)}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <FiBookOpen className="w-4 h-4 mr-2" />
                  {guidance.category}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}