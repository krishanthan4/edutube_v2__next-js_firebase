import Link from 'next/link'
import React from 'react'

function CTA({user}:any) {
  return (
    <div>   <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Transform
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-yellow-500">
              Your Learning?
            </span>
          </h2>
          <p className="text-xl mb-12 text-gray-300 max-w-2xl mx-auto">
            Join thousands of learners who are already building skills and creating courses on Edutube
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {!user ? (
              <>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-10 py-5 bg-orange-500 text-black text-xl font-bold rounded-full hover:bg-orange-400 transition-all transform hover:scale-105"
                >
                  Start Learning Free
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center px-10 py-5 border-2 border-orange-500 text-orange-500 text-xl font-bold rounded-full hover:bg-orange-500 hover:text-black transition-all"
                >
                  Browse Courses
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/courses/create"
                  className="inline-flex items-center px-10 py-5 bg-orange-500 text-black text-xl font-bold rounded-full hover:bg-orange-400 transition-all transform hover:scale-105"
                >
                  Create Your First Course
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center px-10 py-5 border-2 border-orange-500 text-orange-500 text-xl font-bold rounded-full hover:bg-orange-500 hover:text-black transition-all"
                >
                  Explore Courses
                </Link>
              </>
            )}
          </div>
        </div>
      </section></div>
  )
}

export default CTA