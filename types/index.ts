export interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
  createdAt?: any;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  playlistUrl: string;
  categoryId: string;
  category?: string;
  videoCount?: number;
  videos?: Video[];
  createdAt?: any;
  createdBy?: string;
  isPublic?: boolean;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  position: number;
}

export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  videoId: string;
  completed: boolean;
  completedAt?: any;
  updatedAt?: any;
  lastWatched?: any;
  totalWatchTime?: number; // in minutes
  progress?: number; // percentage 0-100
}

export interface PlaylistData {
  title: string;
  description: string;
  thumbnail?: string;
  videos: Video[];
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'user';
  bio?: string;
  createdAt?: any;
  lastLoginAt?: any;
  lastActiveAt?: any;
  updatedAt?: any;
  emailNotifications?: boolean;
  publicProfile?: boolean;
  profileViews?: number;
  currentStreak?: number;
  completedGuidances?: number;
}

export interface Guidance {
  id: string;
  title: string;
  content: string; // Markdown content
  description?: string;
  thumbnail?: string;
  categoryId: string;
  category?: string;
  images?: string[]; // Array of image URLs
  createdBy: string;
  createdAt?: any;
  updatedAt?: any;
  tags?: string[];
}

export interface GuidancePathway {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  items: PathwayItem[];
  createdBy: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface PathwayItem {
  id: string;
  type: 'course' | 'guidance';
  resourceId: string;
  position: number;
  title: string;
  dependencies?: string[]; // IDs of prerequisite items
}

export interface DailyActivity {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  coursesCompleted: number;
  videosWatched: number;
  guidancesCompleted: number;
  totalWatchTime: number; // in minutes
  streakDay: number;
  activities: ActivityType[];
  createdAt?: any;
  updatedAt?: any;
}

export interface ActivityType {
  type: 'course_completed' | 'video_watched' | 'guidance_read' | 'course_created';
  resourceId: string;
  resourceTitle: string;
  timestamp: any;
}

export interface UserStats {
  userId: string;
  totalCourses: number;
  completedCourses: number;
  totalVideos: number;
  totalWatchTime: number;
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  totalGuidancesRead: number;
  lastActiveDate: string;
  createdAt?: any;
  updatedAt?: any;
}