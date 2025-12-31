'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import { 
  FiUsers, 
  FiBookOpen, 
  FiFile, 
  FiTrendingUp,
  FiEye,
  FiPlus,
  FiArrowUpRight,
  FiActivity,
  FiClock
} from 'react-icons/fi';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalGuidances: number;
  totalViews: number;
  recentUsers: any[];
  recentCourses: any[];
}

export default function AdminDashboard() {
  const { userProfile } = useAuth() as any;
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalGuidances: 0,
    totalViews: 0,
    recentUsers: [],
    recentCourses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // TODO: Implement actual data fetching from Firestore
      // For now, using mock data
      setStats({
        totalUsers: 1247,
        totalCourses: 58,
        totalGuidances: 127,
        totalViews: 23456,
        recentUsers: [
          { id: '1', email: 'john.doe@example.com', createdAt: new Date() },
          { id: '2', email: 'jane.smith@example.com', createdAt: new Date() },
          { id: '3', email: 'mike.johnson@example.com', createdAt: new Date() },
        ],
        recentCourses: [
          { id: '1', title: 'Advanced React Patterns', createdAt: new Date() },
          { id: '2', title: 'Node.js Microservices', createdAt: new Date() },
          { id: '3', title: 'TypeScript Fundamentals', createdAt: new Date() },
        ]
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: FiUsers,
      href: '/admin/users',
      change: '+12.5%',
      changeType: 'increase'
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses.toLocaleString(),
      icon: FiBookOpen,
      href: '/admin/courses',
      change: '+8.2%',
      changeType: 'increase'
    },
    {
      title: 'Total Guidances',
      value: stats.totalGuidances.toLocaleString(),
      icon: FiFile,
      href: '/admin/guidances',
      change: '+15.3%',
      changeType: 'increase'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: FiEye,
      href: '/admin',
      change: '+23.1%',
      changeType: 'increase'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Monitor your platform's performance and activity</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/admin/courses/create"
            className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add Course
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              href={card.href}
              className="bg-white p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <FiArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                <p className="text-sm text-green-600 font-medium">{card.change}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              <p className="text-sm text-gray-600">New user registrations</p>
            </div>
            <Link
              href="/admin/users"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentUsers.map((user, index) => (
              <div key={user.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <FiUsers className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                  <p className="text-xs text-gray-600 flex items-center">
                    <FiClock className="w-3 h-3 mr-1" />
                    {user.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Courses</h2>
              <p className="text-sm text-gray-600">Latest course additions</p>
            </div>
            <Link
              href="/admin/courses"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentCourses.map((course, index) => (
              <div key={course.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <FiBookOpen className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                  <p className="text-xs text-gray-600 flex items-center">
                    <FiClock className="w-3 h-3 mr-1" />
                    {course.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/courses/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-gray-100 rounded-lg mr-4">
              <FiPlus className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Create Course</p>
              <p className="text-sm text-gray-600">Add a new course</p>
            </div>
          </Link>
          
          <Link
            href="/admin/guidances/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-gray-100 rounded-lg mr-4">
              <FiFile className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Create Guidance</p>
              <p className="text-sm text-gray-600">Add new guidance</p>
            </div>
          </Link>
          
          <Link
            href="/admin/pathways/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-gray-100 rounded-lg mr-4">
              <FiTrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Create Pathway</p>
              <p className="text-sm text-gray-600">Add learning pathway</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
