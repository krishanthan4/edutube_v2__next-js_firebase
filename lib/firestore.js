import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Categories
export const createCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...categoryData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const q = query(collection(db, 'categories'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

// Courses
export const createCourse = async (courseData) => {
  try {
    const docRef = await addDoc(collection(db, 'courses'), {
      ...courseData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const getCourses = async (categoryId = null) => {
  try {
    let q;
    if (categoryId) {
      q = query(
        collection(db, 'courses'), 
        where('categoryId', '==', categoryId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting courses:', error);
    throw error;
  }
};

export const getCourse = async (courseId) => {
  try {
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Course not found');
    }
  } catch (error) {
    console.error('Error getting course:', error);
    throw error;
  }
};

// User Progress
export const createUserProgress = async (userId, courseId, videoId) => {
  try {
    const docRef = await addDoc(collection(db, 'userProgress'), {
      userId,
      courseId,
      videoId,
      completed: true,
      completedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating user progress:', error);
    throw error;
  }
};

export const getUserProgress = async (userId, courseId) => {
  try {
    const q = query(
      collection(db, 'userProgress'),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
};

export const updateUserProgress = async (progressId, data) => {
  try {
    const docRef = doc(db, 'userProgress', progressId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

// YouTube API functions
export const fetchPlaylistData = async (playlistUrl) => {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const playlistId = extractPlaylistId(playlistUrl);
  
  if (!playlistId) {
    throw new Error('Invalid playlist URL');
  }

  try {
    // Get playlist info
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?key=${apiKey}&part=snippet&id=${playlistId}`
    );
    const playlistData = await playlistResponse.json();
    
    if (!playlistData.items || playlistData.items.length === 0) {
      throw new Error('Playlist not found');
    }

    // Get playlist items
    const itemsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=50`
    );
    const itemsData = await itemsResponse.json();

    return {
      title: playlistData.items[0].snippet.title,
      description: playlistData.items[0].snippet.description,
      thumbnail: playlistData.items[0].snippet.thumbnails?.medium?.url || playlistData.items[0].snippet.thumbnails?.default?.url,
      videos: itemsData.items.map(item => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        position: item.snippet.position
      }))
    };
  } catch (error) {
    console.error('Error fetching playlist data:', error);
    throw error;
  }
};

// Helper function to extract playlist ID from URL
const extractPlaylistId = (url) => {
  const regex = /list=([A-Za-z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};