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
}

export interface PlaylistData {
  title: string;
  description: string;
  thumbnail?: string;
  videos: Video[];
}