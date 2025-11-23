'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { DailyActivity, UserStats } from '../../types';
import { 
  FiZap, 
  FiTrendingUp, 
  FiCalendar,
  FiTarget,
  FiActivity
} from 'react-icons/fi';

interface ActivityCalendarProps {
  userId: string;
  className?: string;
}

interface CalendarDay {
  date: string;
  activity: number; // 0-4 scale for activity level
  count: number; // actual number of activities
}

export default function ActivityCalendar({ userId, className = '' }: ActivityCalendarProps) {
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  useEffect(() => {
    if (userId) {
      fetchActivityData();
    }
  }, [userId]);

  const fetchActivityData = async () => {
    try {
      setIsLoading(true);

      // Get the last 365 days of activity
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const activitiesQuery = query(
        collection(db, 'dailyActivities'),
        where('userId', '==', userId),
        where('date', '>=', formatDate(oneYearAgo)),
        orderBy('date', 'desc'),
        limit(365)
      );

      const [activitiesSnapshot, statsSnapshot] = await Promise.all([
        getDocs(activitiesQuery),
        getDocs(query(collection(db, 'userStats'), where('userId', '==', userId), limit(1)))
      ]);

      const activitiesData = activitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DailyActivity[];

      const statsData = statsSnapshot.docs.length > 0 ? 
        { ...statsSnapshot.docs[0].data() } as UserStats : 
        null;

      setActivities(activitiesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const generateCalendarData = (): CalendarDay[] => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364); // Show last 365 days
    
    const calendarDays: CalendarDay[] = [];
    const activityMap = new Map();
    
    // Create map of activities by date
    activities.forEach(activity => {
      const totalActivity = activity.coursesCompleted + activity.videosWatched + activity.guidancesCompleted;
      activityMap.set(activity.date, totalActivity);
    });
    
    // Generate all days for the last year
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = formatDate(date);
      const count = activityMap.get(dateStr) || 0;
      
      // Activity level: 0 (none), 1 (low), 2 (medium), 3 (high), 4 (very high)
      let level = 0;
      if (count > 0) level = 1;
      if (count >= 3) level = 2;
      if (count >= 6) level = 3;
      if (count >= 10) level = 4;
      
      calendarDays.push({
        date: dateStr,
        activity: level,
        count
      });
    }
    
    return calendarDays;
  };

  const getActivityColor = (level: number): string => {
    switch (level) {
      case 0: return 'bg-gray-100';
      case 1: return 'bg-green-200';
      case 2: return 'bg-green-300';
      case 3: return 'bg-green-500';
      case 4: return 'bg-green-700';
      default: return 'bg-gray-100';
    }
  };

  const getMonthLabels = (): string[] => {
    const months = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      months.push(date.toLocaleString('default', { month: 'short' }));
    }
    
    return months;
  };

  const getDayLabels = (): string[] => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  };

  const calendarData = generateCalendarData();
  const monthLabels = getMonthLabels();
  const dayLabels = getDayLabels();

  // Calculate weeks for proper grid layout
  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];
  
  calendarData.forEach((day, index) => {
    const dayOfWeek = new Date(day.date).getDay();
    
    if (index === 0) {
      // Pad the first week with empty days if needed
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({ date: '', activity: 0, count: 0 });
      }
    }
    
    currentWeek.push(day);
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  if (currentWeek.length > 0) {
    // Pad the last week if needed
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', activity: 0, count: 0 });
    }
    weeks.push(currentWeek);
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-53 gap-1 mb-4">
            {[...Array(365)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FiActivity className="mr-2" />
            Activity Overview
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {calendarData.filter(day => day.count > 0).length} days active in the last year
          </p>
        </div>
        
        {stats && (
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="flex items-center text-orange-600">
                <FiZap className="w-4 h-4 mr-1" />
                <span className="font-bold">{stats.currentStreak}</span>
              </div>
              <span className="text-gray-600">Current</span>
            </div>
            <div className="text-center">
              <div className="flex items-center text-green-600">
                <FiTrendingUp className="w-4 h-4 mr-1" />
                <span className="font-bold">{stats.longestStreak}</span>
              </div>
              <span className="text-gray-600">Longest</span>
            </div>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="space-y-2">
        {/* Month labels */}
        <div className="flex justify-between text-xs text-gray-600 mb-2 px-2">
          {monthLabels.map((month, index) => (
            <span key={index} className="w-8 text-center">{month}</span>
          ))}
        </div>
        
        {/* Day labels and calendar grid */}
        <div className="flex">
          {/* Day labels */}
          <div className="mr-2 space-y-1">
            {dayLabels.map((day, index) => (
              <div key={index} className="w-6 h-3 text-xs text-gray-600 flex items-center justify-end pr-1">
                {index % 2 === 0 ? day : ''}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-53 gap-1">
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 ${
                    day.date ? getActivityColor(day.activity) : ''
                  } ${day.date ? 'hover:ring-2 hover:ring-blue-300' : ''}`}
                  title={day.date ? `${day.date}: ${day.count} activities` : ''}
                  onClick={() => day.date && setSelectedDay(day)}
                />
              ))
            )}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-gray-600">Less</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">More</span>
        </div>
      </div>

      {/* Selected day details */}
      {selectedDay && selectedDay.count > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            {new Date(selectedDay.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          <p className="text-sm text-gray-600">
            {selectedDay.count} activities completed on this day
          </p>
        </div>
      )}
      
      {/* Quick stats */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{stats.totalCourses}</div>
            <div className="text-xs text-gray-600">Courses</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.completedCourses}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{Math.round(stats.totalWatchTime / 60)}h</div>
            <div className="text-xs text-gray-600">Watch Time</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{stats.totalGuidancesRead}</div>
            <div className="text-xs text-gray-600">Guidances</div>
          </div>
        </div>
      )}
    </div>
  );
}