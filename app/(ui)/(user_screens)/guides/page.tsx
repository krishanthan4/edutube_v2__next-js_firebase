'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import SearchBar from './components/SearchBar';
import HeroBanner from './components/HeroBanner';
import GuideRow from './components/GuideRow';

interface Guidance {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: any;
  updatedAt: any;
  readTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  featured: boolean;
  rating?: number;
  imageUrl?: string;
}

interface Pathway {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: any;
  updatedAt: any;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  featured: boolean;
  modules: number;
  students: number;
  rating: number;
  imageUrl?: string;
}

export default function GuidesPage() {
  const [guidances, setGuidances] = useState<Guidance[]>([]);
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch guidances
      const guidancesRef = collection(db, 'guidances');
      const guidancesSnapshot = await getDocs(guidancesRef);
      const guidancesData = guidancesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Guidance));

      // Fetch pathways
      const pathwaysRef = collection(db, 'pathways');
      const pathwaysSnapshot = await getDocs(pathwaysRef);
      const pathwaysData = pathwaysSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Pathway));

      setGuidances(guidancesData);
      setPathways(pathwaysData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search term
  const filteredGuidances = guidances.filter(guide =>
    !searchTerm || 
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPathways = pathways.filter(pathway =>
    !searchTerm || 
    pathway.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pathway.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pathway.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pathway.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Categorize guides
  const featuredGuidances = filteredGuidances.filter(guide => guide.featured);
  const beginnerGuidances = filteredGuidances.filter(guide => guide.difficulty === 'beginner');
  const intermediateGuidances = filteredGuidances.filter(guide => guide.difficulty === 'intermediate');
  const advancedGuidances = filteredGuidances.filter(guide => guide.difficulty === 'advanced');

  // Categorize pathways
  const featuredPathways = filteredPathways.filter(pathway => pathway.featured);
  const popularPathways = filteredPathways.sort((a, b) => (b.students || 0) - (a.students || 0)).slice(0, 6);

  // Convert pathway data to match guide format
  const convertPathwayToGuide = (pathway: Pathway) => ({
    id: pathway.id,
    title: pathway.title,
    description: pathway.description,
    author: pathway.author,
    readTime: pathway.estimatedTime * 60, // Convert hours to minutes
    difficulty: pathway.difficulty,
    rating: pathway.rating,
    category: pathway.category,
    featured: pathway.featured,
    imageUrl: pathway.imageUrl
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Loading guides...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar - Above Banner */}
      <div className="relative z-20 pt-8 pb-4">
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search guides and pathways..."
        />
      </div>

      {/* Hero Banner */}
      <HeroBanner 
        title="Learn. Practice. Master."
        subtitle="Discover comprehensive guides and learning pathways to advance your skills and knowledge"
      />

      {/* Guide Rows */}
      <div className="py-12 space-y-8">
        {/* Featured Guidances */}
        {featuredGuidances.length > 0 && (
          <GuideRow 
            title="🌟 Featured Guides" 
            guides={featuredGuidances}
            linkType="guidance"
          />
        )}

        {/* Featured Pathways */}
        {featuredPathways.length > 0 && (
          <GuideRow 
            title="🚀 Featured Learning Pathways" 
            guides={featuredPathways.map(convertPathwayToGuide)}
            linkType="pathway"
          />
        )}

        {/* Popular Pathways */}
        {popularPathways.length > 0 && (
          <GuideRow 
            title="🔥 Popular Learning Paths" 
            guides={popularPathways.map(convertPathwayToGuide)}
            linkType="pathway"
          />
        )}

        {/* Beginner Guides */}
        {beginnerGuidances.length > 0 && (
          <GuideRow 
            title="🌱 Beginner Guides" 
            guides={beginnerGuidances}
            linkType="guidance"
          />
        )}

        {/* Intermediate Guides */}
        {intermediateGuidances.length > 0 && (
          <GuideRow 
            title="⚡ Intermediate Guides" 
            guides={intermediateGuidances}
            linkType="guidance"
          />
        )}

        {/* Advanced Guides */}
        {advancedGuidances.length > 0 && (
          <GuideRow 
            title="🔥 Advanced Guides" 
            guides={advancedGuidances}
            linkType="guidance"
          />
        )}

        {/* No results message */}
        {searchTerm && filteredGuidances.length === 0 && filteredPathways.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">
              Try searching with different keywords or browse our categories
            </p>
          </div>
        )}
      </div>
    </div>
  );
}