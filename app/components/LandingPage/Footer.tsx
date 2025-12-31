import Link from 'next/link'
import React from 'react'
import { FiHeart, FiShield } from 'react-icons/fi'

function Footer({user} : any) {
  return (
         <footer className="bg-black border-t border-gray-800 text-white pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-3xl font-bold mb-4 text-orange-400">Edutube</h3>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                Transform YouTube playlists into premium learning experiences. 
                The world's first completely free learning platform with all premium features.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <FiShield className="w-4 h-4" />
                <span>Always free, always secure, always yours</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Platform</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/courses" className="hover:text-orange-400 transition-colors">Browse Courses</Link></li>
                {user ? (
                  <li><Link href="/courses/create" className="hover:text-orange-400 transition-colors">Create Course</Link></li>
                ) : (
                  <>
                    <li><Link href="/auth/login" className="hover:text-orange-400 transition-colors">Sign In</Link></li>
                    <li><Link href="/auth/signup" className="hover:text-orange-400 transition-colors">Sign Up Free</Link></li>
                  </>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Features</h4>
              <ul className="space-y-3 text-gray-400">
                <li>Progress Tracking</li>
                <li>Daily Streaks</li>
                <li>Course Sharing</li>
                <li>Personal Hub</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2025 Edutube. Made By <a href="https://krishanthan4.github.io" target="_blank">Krishanthan</a>.
            </p>
          </div>
        </div>
      </footer>
  )
}

export default Footer