'use client';
import { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import GuideCard from './GuideCard';

interface Guide {
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
}

interface GuideRowProps {
  title: string;
  guides: Guide[];
  linkType?: 'guidance' | 'pathway';
}

export default function GuideRow({ title, guides, linkType = 'guidance' }: GuideRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340; // Card width + margin
      const currentScroll = scrollRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  if (!guides || guides.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-6 px-6">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-50 group"
            disabled={guides.length <= 3}
          >
            <FiChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-gray-800" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-50 group"
            disabled={guides.length <= 3}
          >
            <FiChevronRight className="w-6 h-6 text-gray-600 group-hover:text-gray-800" />
          </button>
        </div>
      </div>

      {/* Scrollable Cards Container */}
      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide space-x-4 px-6 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {guides.map((guide) => (
            <GuideCard
              key={guide.id}
              id={guide.id}
              title={guide.title}
              description={guide.description}
              author={guide.author}
              readTime={guide.readTime}
              difficulty={guide.difficulty}
              rating={guide.rating}
              category={guide.category}
              featured={guide.featured}
              imageUrl={guide.imageUrl}
              linkType={linkType}
            />
          ))}
        </div>

        {/* Gradient overlays for scroll indication */}
        <div className="absolute left-0 top-0 bottom-4 w-6 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-4 w-6 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}