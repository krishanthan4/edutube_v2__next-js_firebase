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
  FiTrendingUp,
  FiPlay,
  FiCheckCircle,
  FiCircle,
  FiAward
} from 'react-icons/fi';

interface PathwayModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed?: boolean;
  locked?: boolean;
}

interface LearningPathway {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: any;
  updatedAt: any;
  estimatedTime: number; // in hours
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  featured: boolean;
  modules: PathwayModule[];
  students: number;
  rating: number;
  progress?: number;
  imageUrl?: string;
  prerequisites?: string[];
  learningOutcomes?: string[];
}

export default function PathwayDetailPage() {
  const params = useParams();
  const pathwayId = params.id as string;
  const [pathway, setPathway] = useState<LearningPathway | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState(0);

  useEffect(() => {
    if (pathwayId) {
      fetchPathway();
    }
  }, [pathwayId]);

  const fetchPathway = async () => {
    try {
      setLoading(true);
      const pathwayRef = doc(db, 'guidancePathways', pathwayId);
      const pathwayDoc = await getDoc(pathwayRef);
      
      if (pathwayDoc.exists()) {
        const pathwayData = { id: pathwayDoc.id, ...pathwayDoc.data() } as LearningPathway;
        setPathway(pathwayData);
        setUserProgress(pathwayData.progress || 0);
      }
    } catch (error) {
      console.error('Error fetching pathway:', error);
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

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Loading pathway...</div>
        </div>
      </div>
    );
  }

  if (!pathway) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pathway Not Found</h1>
          <p className="text-gray-600 mb-6">The pathway you're looking for doesn't exist.</p>
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
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Back Button */}
          <Link 
            href="/guides"
            className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back to Guides
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Content */}
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(pathway.difficulty)}`}>
                  {pathway.difficulty.charAt(0).toUpperCase() + pathway.difficulty.slice(1)}
                </span>
                <span className="text-white/80 text-sm">{pathway.category}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6">{pathway.title}</h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {pathway.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatDuration(pathway.estimatedTime)}</div>
                  <div className="text-white/80 text-sm">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{pathway.modules?.length || 0}</div>
                  <div className="text-white/80 text-sm">Modules</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{pathway.students?.toLocaleString() || '0'}</div>
                  <div className="text-white/80 text-sm">Students</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-2xl font-bold">
                    <FiStar className="w-6 h-6 mr-1 text-yellow-400 fill-current" />
                    {pathway.rating?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="text-white/80 text-sm">Rating</div>
                </div>
              </div>

              {/* Progress Bar */}
              {userProgress > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Your Progress</span>
                    <span>{userProgress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${userProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  <FiPlay className="w-5 h-5 mr-2" />
                  {userProgress > 0 ? 'Continue Learning' : 'Start Pathway'}
                </button>
                <button className="flex items-center justify-center px-8 py-4 border-2 border-white/20 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  <FiBookOpen className="w-5 h-5 mr-2" />
                  Preview Content
                </button>
              </div>
            </div>

            {/* Image/Visual */}
            <div className="flex items-center justify-center">
              {pathway.imageUrl ? (
                <img 
                  src={pathway.imageUrl} 
                  alt={pathway.title}
                  className="rounded-lg shadow-2xl max-w-md w-full"
                />
              ) : (
                <div className="w-full max-w-md h-64 bg-white/10 rounded-lg flex items-center justify-center">
                  <FiBookOpen className="w-24 h-24 text-white/50" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* About */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Pathway</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {pathway.fullDescription || pathway.description}
                </p>
              </div>
            </section>

            {/* Learning Outcomes */}
            {pathway.learningOutcomes && pathway.learningOutcomes.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Learn</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {pathway.learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <FiCheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{outcome}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Modules */}
            {pathway.modules && pathway.modules.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Modules</h2>
                <div className="space-y-4">
                  {pathway.modules.map((module, index) => (
                    <div key={module.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {module.completed ? (
                              <FiCheckCircle className="w-6 h-6 text-green-500" />
                            ) : module.locked ? (
                              <FiCircle className="w-6 h-6 text-gray-300" />
                            ) : (
                              <FiPlay className="w-6 h-6 text-blue-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Module {index + 1}: {module.title}
                            </h3>
                            <p className="text-gray-600 mt-1">{module.description}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <FiClock className="w-4 h-4 mr-1" />
                          {module.duration} min
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Instructor */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{pathway.author}</div>
                  <div className="text-sm text-gray-600">Expert Instructor</div>
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            {pathway.prerequisites && pathway.prerequisites.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Prerequisites</h3>
                <ul className="space-y-2">
                  {pathway.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <FiCircle className="w-2 h-2 text-gray-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {pathway.tags && pathway.tags.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {pathway.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      <FiTag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certificate */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FiAward className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Certificate</h3>
              </div>
              <p className="text-sm text-gray-700">
                Complete this pathway to earn a certificate of completion that you can share on your profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}