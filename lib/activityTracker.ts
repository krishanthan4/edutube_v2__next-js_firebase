import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
   
  where, 
  getDocs, 
  orderBy, 
  limit, 
  Timestamp, 
  query
} from 'firebase/firestore';
import { db } from './firebase';
import { DailyActivity, ActivityType, UserStats } from '../types';

export const formatDateForActivity = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

export const trackUserActivity = async (
  userId: string,
  activityType: ActivityType['type'],
  resourceId: string,
  resourceTitle: string
) => {
  try {
    const today = formatDateForActivity();
    const activityId = `${userId}_${today}`;
    
    // Get or create daily activity document
    const activityRef = doc(db, 'dailyActivities', activityId);
    const activityDoc = await getDoc(activityRef);
    
    const newActivity: ActivityType = {
      type: activityType,
      resourceId,
      resourceTitle,
      timestamp: Timestamp.now()
    };
    
    if (activityDoc.exists()) {
      // Update existing activity
      const existingData = activityDoc.data() as DailyActivity;
      const updatedActivities = [...(existingData.activities || []), newActivity];
      
      // Calculate updated counts
      const coursesCompleted = updatedActivities.filter(a => a.type === 'course_completed').length;
      const videosWatched = updatedActivities.filter(a => a.type === 'video_watched').length;
      const guidancesCompleted = updatedActivities.filter(a => a.type === 'guidance_read').length;
      
      await updateDoc(activityRef, {
        activities: updatedActivities,
        coursesCompleted,
        videosWatched,
        guidancesCompleted,
        updatedAt: Timestamp.now()
      });
    } else {
      // Create new daily activity
      const counts = {
        coursesCompleted: activityType === 'course_completed' ? 1 : 0,
        videosWatched: activityType === 'video_watched' ? 1 : 0,
        guidancesCompleted: activityType === 'guidance_read' ? 1 : 0,
        totalWatchTime: 0
      };
      
      // Calculate streak
      const streakDay = await calculateStreakDay(userId, today);
      
      const dailyActivity: Omit<DailyActivity, 'id'> = {
        userId,
        date: today,
        ...counts,
        streakDay,
        activities: [newActivity],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      await setDoc(activityRef, dailyActivity);
    }
    
    // Update user stats
    await updateUserStats(userId);
    
    console.log('Activity tracked successfully');
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
};

const calculateStreakDay = async (userId: string, currentDate: string): Promise<number> => {
  try {
    // Get recent activities to calculate streak
    const recentActivitiesQuery = query(
      collection(db, 'dailyActivities'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(365)
    );
    
    const activitiesSnapshot = await getDocs(recentActivitiesQuery);
    const activities = activitiesSnapshot.docs.map(doc => doc.data() as DailyActivity);
    
    // Sort by date
    activities.sort((a, b) => b.date.localeCompare(a.date));
    
    let streak = 1; // Current day
    let checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() - 1); // Start with yesterday
    
    // Check consecutive days
    for (const activity of activities) {
      const activityDate = formatDateForActivity(checkDate);
      
      if (activity.date === activityDate) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Gap found, streak ends
        break;
      }
    }
    
    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 1;
  }
};

const updateUserStats = async (userId: string) => {
  try {
    // Get all user activities
    const activitiesQuery = query(
      collection(db, 'dailyActivities'),
      where('userId', '==', userId)
    );
    
    const activitiesSnapshot = await getDocs(activitiesQuery);
    const activities = activitiesSnapshot.docs.map(doc => doc.data() as DailyActivity);
    
    // Calculate totals
    let totalCourses = 0;
    let completedCourses = 0;
    let totalVideos = 0;
    let totalWatchTime = 0;
    let totalGuidancesRead = 0;
    let longestStreak = 0;
    let currentStreak = 0;
    
    const uniqueCourses = new Set();
    const uniqueVideos = new Set();
    
    activities.forEach(activity => {
      totalWatchTime += activity.totalWatchTime || 0;
      totalGuidancesRead += activity.guidancesCompleted || 0;
      longestStreak = Math.max(longestStreak, activity.streakDay || 0);
      
      if (activity.activities) {
        activity.activities.forEach(act => {
          if (act.type === 'course_completed') {
            uniqueCourses.add(act.resourceId);
          }
          if (act.type === 'video_watched') {
            uniqueVideos.add(act.resourceId);
          }
        });
      }
    });
    
    // Calculate current streak (from most recent activity)
    if (activities.length > 0) {
      const sortedActivities = activities.sort((a, b) => b.date.localeCompare(a.date));
      currentStreak = sortedActivities[0]?.streakDay || 0;
    }
    
    totalCourses = uniqueCourses.size;
    completedCourses = uniqueCourses.size; // Assuming all tracked courses are completed
    totalVideos = uniqueVideos.size;
    
    // Update or create user stats
    const statsRef = doc(db, 'userStats', userId);
    const statsData: Omit<UserStats, 'userId'> = {
      totalCourses,
      completedCourses,
      totalVideos,
      totalWatchTime,
      currentStreak,
      longestStreak,
      totalDays: activities.length,
      totalGuidancesRead,
      lastActiveDate: formatDateForActivity(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(statsRef, { userId, ...statsData }, { merge: true });
    
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

export const addWatchTime = async (userId: string, watchTimeMinutes: number) => {
  try {
    const today = formatDateForActivity();
    const activityId = `${userId}_${today}`;
    const activityRef = doc(db, 'dailyActivities', activityId);
    const activityDoc = await getDoc(activityRef);
    
    if (activityDoc.exists()) {
      const existingData = activityDoc.data() as DailyActivity;
      await updateDoc(activityRef, {
        totalWatchTime: (existingData.totalWatchTime || 0) + watchTimeMinutes,
        updatedAt: Timestamp.now()
      });
    } else {
      // Create new activity if it doesn't exist
      const streakDay = await calculateStreakDay(userId, today);
      const dailyActivity: Omit<DailyActivity, 'id'> = {
        userId,
        date: today,
        coursesCompleted: 0,
        videosWatched: 0,
        guidancesCompleted: 0,
        totalWatchTime: watchTimeMinutes,
        streakDay,
        activities: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      await setDoc(activityRef, dailyActivity);
    }
    
    await updateUserStats(userId);
  } catch (error) {
    console.error('Error adding watch time:', error);
  }
};

export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    const statsRef = doc(db, 'userStats', userId);
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      return { ...statsDoc.data() } as UserStats;
    }
    return null;
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
};

export const getDailyActivities = async (userId: string, limitCount?: number): Promise<DailyActivity[]> => {
  try {
    const queryConstraints = [
      where('userId', '==', userId),
      orderBy('date', 'desc')
    ];
    const activitiesQuery = limitCount
      ? query(
          collection(db, 'dailyActivities'),
          ...queryConstraints,
          limit(limitCount)
        )
      : query(
          collection(db, 'dailyActivities'),
          ...queryConstraints
        );
    
    const activitiesSnapshot = await getDocs(activitiesQuery);
    return activitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DailyActivity[];
  } catch (error) {
    console.error('Error getting daily activities:', error);
    return [];
  }
};