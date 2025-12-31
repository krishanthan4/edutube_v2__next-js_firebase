'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { getCourses } from '@/app/lib/firestore';
import { Course } from '@/app/types';
import Navbar from './components/Navbar';
import Footer from './components/LandingPage/Footer';
import CTA from './components/LandingPage/CTA';
import FAQ from './components/LandingPage/FAQ';
import Advantages from './components/LandingPage/Advantages';
import DemoVideo from './components/LandingPage/DemoVideo';
import Hero from './components/LandingPage/Hero/Hero';

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publicCourses: 0,
    totalStudents: 0
  });
  const [showPremium, setShowPremium] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const allCourses = await getCourses();
        // Show only public courses for featured section
        const publicCourses = allCourses.filter(course => course.isPublic);
        // Get the 6 newest public courses
        const featured = publicCourses
          .sort((a, b) => new Date(b.createdAt?.toDate() || 0).getTime() - new Date(a.createdAt?.toDate() || 0).getTime())
          .slice(0, 6);
        
        setFeaturedCourses(featured as Course[]);
        setStats({
          totalCourses: allCourses.length,
          publicCourses: publicCourses.length,
          totalStudents: Math.floor(Math.random() * 5000) + 1000 // Simulated for demo
        });
      } catch (error) {
        console.error('Error fetching featured courses:', error);
      }
    };

    fetchFeaturedCourses();
  }, []);

  // Animation cycle effect
  useEffect(() => {
    const animationCycle = () => {
      setShowPremium(true);
      setTimeout(() => {
        setShowPremium(false);
      }, 3000);
    };

    // Start first animation after 1 second
    const initialTimeout = setTimeout(animationCycle, 1000);
    
    // Repeat every 5 seconds
    const interval = setInterval(animationCycle, 5000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section - YouTube to Premium Courses */}
  <Hero stats={stats} user={user}/>
    {/* <Hero /> */}
<DemoVideo/>
      {/* Why This Special Section */}
    <Advantages/>

      {/* FAQ Section */}
     <FAQ openFaq={openFaq} setOpenFaq={setOpenFaq}/>


      {/* CTA Section */}
   <CTA user={user}/>

      {/* Footer */}
 <Footer user={user}/>
    </div>
  );
}