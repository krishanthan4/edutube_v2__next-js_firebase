import Link from "next/link";
import React from "react";
import { FiBookOpen, FiClock, FiShare2 } from "react-icons/fi";

function CourseCard({course,user}:{course:any,user:any}) {
  return (
    <div
      key={course.id}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md cursor-pointer group hover:scale-105 transition-transform duration-200 relative"
    >
      <Link
        href={
          user
            ? `/courses/${course.id}/viewer`
            : course.isPublic
            ? `/courses/${course.id}/viewer`
            : `/auth/login`
        }
      >
        <div className="aspect-w-16 aspect-h-9 relative">
          <img
            src={course.thumbnail || "/api/placeholder/400/225"}
            alt={course.title}
            className="w-full h-48 object-cover rounded-t-lg"
            draggable="false"
          />
          {course.isPublic && (
            <div className="absolute top-2 right-2">
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                Public
              </span>
            </div>
          )}
          {user &&
            !course.isPublic &&
            (course.createdBy === user.uid || course.userId === user.uid) && (
              <div className="absolute top-2 right-2">
                <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  My Private
                </span>
              </div>
            )}
          {!user && !course.isPublic && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium px-3 py-1 bg-blue-600 rounded-full">
                Sign in to access
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {course.description}
          </p>
          <div className="hidden  items-center justify-between text-xs text-gray-500 mb-2">
            <span className="flex items-center space-x-1">
              <FiBookOpen className="w-3 h-3" />
              <span>{course.videoCount || 0} lessons</span>
            </span>
            <span className="flex items-center space-x-1">
              <FiClock className="w-3 h-3" />
              <span>
                {new Date(course.createdAt?.toDate() || 0).toLocaleDateString()}
              </span>
            </span>
          </div>
         
        </div>
      </Link>

      {/* Share button for public courses */}
      {course.isPublic && (
        <button
          onClick={(e) => {
            e.preventDefault();
            const shareUrl = `${window.location.origin}/courses/${course.id}/viewer`;
            if (navigator.share) {
              navigator.share({
                title: course.title,
                text: course.description,
                url: shareUrl,
              });
            } else {
              navigator.clipboard.writeText(shareUrl);
              alert("Course URL copied to clipboard!");
            }
          }}
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-600 hover:text-blue-600 p-2 rounded-full shadow-md"
          title="Share this course"
        >
          <FiShare2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default CourseCard;
