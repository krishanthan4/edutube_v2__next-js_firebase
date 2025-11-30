'use client';
import Link from 'next/link';
import { FiClock, FiUser, FiStar, FiArrowRight, FiBookOpen } from 'react-icons/fi';

interface GuideCardProps {
  id: string;
  title: string;
  description: string;
  author: string;
  readTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating?: number;
  category: string;
  featured?: boolean;
  imageUrl?: string;
  linkType?: 'guidance' | 'pathway';
}

export default function GuideCard({
  id,
  title,
  description,
  author,
  readTime,
  difficulty,
  rating,
  category,
  featured = false,
  imageUrl,
  linkType = 'guidance'
}: GuideCardProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours}h`;
    }
    return `${minutes}min`;
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 min-w-[320px] max-w-[320px] mx-2">
      {/* Card Image/Header */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-t-xl overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiBookOpen className="w-16 h-16 text-white/80" />
          </div>
        )}
        
        {/* Featured badge */}
        {featured && (
          <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
            FEATURED
          </div>
        )}

        {/* Difficulty badge */}
        <div className="absolute top-4 right-4">
          <div className={`${getDifficultyColor(difficulty)} text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide`}>
            {difficulty}
          </div>
        </div>

        {/* Category tag */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
          {category}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {description}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FiUser className="w-4 h-4 mr-1" />
              <span>{author}</span>
            </div>
            <div className="flex items-center">
              <FiClock className="w-4 h-4 mr-1" />
              <span>{formatTime(readTime)}</span>
            </div>
          </div>
          
          {rating && (
            <div className="flex items-center">
              <FiStar className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Action button */}
        <Link 
          href={`/${linkType === 'guidance' ? 'guidances' : 'pathways'}/${id}`}
          className="inline-flex items-center justify-between w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 group/btn"
        >
          <span>Start {linkType === 'guidance' ? 'Guide' : 'Pathway'}</span>
          <FiArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}