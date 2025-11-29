'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { 
  FiUsers, 
  FiBookOpen, 
  FiFile, 
  FiTrendingUp,
  FiEye,
  FiPlus
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
        totalUsers: 150,
        totalCourses: 25,
        totalGuidances: 45,
        totalViews: 1250,
        recentUsers: [
          { id: '1', email: 'user1@example.com', createdAt: new Date() },
          { id: '2', email: 'user2@example.com', createdAt: new Date() },
        ],
        recentCourses: [
          { id: '1', title: 'React Basics', createdAt: new Date() },
          { id: '2', title: 'Node.js Advanced', createdAt: new Date() },
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'bg-blue-500',
      href: '/admin/users'
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: FiBookOpen,
      color: 'bg-green-500',
      href: '/admin/courses'
    },
    {
      title: 'Total Guidances',
      value: stats.totalGuidances,
      icon: FiFile,
      color: 'bg-purple-500',
      href: '/admin/guidances'
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: FiEye,
      color: 'bg-orange-500',
      href: '/admin/analytics'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userProfile?.displayName || 'Admin'}</p>
        </div>
        <div className="flex space-x-4">
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <FiPlus className="w-4 h-4" />
            <span>New Course</span>
          </button>
          <button className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            <FiPlus className="w-4 h-4" />
            <span>New Guidance</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${card.color} rounded-lg p-3 text-white mr-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-gray-600">{card.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">View</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Courses</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <p className="text-sm text-gray-500">
                      Created {new Date(course.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">View</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
            <FiUsers className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-600">View and manage user accounts</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
            <FiBookOpen className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Manage Courses</h3>
            <p className="text-sm text-gray-600">Review and moderate courses</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
            <FiTrendingUp className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">View Analytics</h3>
            <p className="text-sm text-gray-600">See platform performance</p>
          </button>
        </div>
      </div>
    </div>
  );
}