import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Debug utility to check user permissions and Firestore rules
 */
export const debugUserPermissions = async (userId: string) => {
  try {
    console.log('🔍 Debugging user permissions for:', userId);
    
    // Check if user document exists
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('❌ User document does not exist in Firestore');
      console.log('📝 You need to create a user document first');
      return false;
    }
    
    const userData = userDoc.data();
    console.log('✅ User document found:', userData);
    
    // Check if user has admin role
    if (userData.role === 'admin') {
      console.log('✅ User has admin role');
      return true;
    } else {
      console.warn('⚠️  User role is:', userData.role);
      console.log('📝 To fix: Set role to "admin" in Firestore');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error checking user permissions:', error);
    
    if (error instanceof Error && 'code' in error && error.code === 'permission-denied') {
      console.log('📝 Permission denied - check Firestore rules');
    }
    
    return false;
  }
};

/**
 * Create user document with admin role (for initial setup)
 */
export const createAdminUser = async (userId: string, email: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    const userData = {
      uid: userId,
      email: email,
      role: 'admin',
      createdAt: new Date(),
      lastLoginAt: new Date()
    };
    
    // This might fail if rules are too restrictive
    await setDoc(userRef, userData);
    console.log('✅ Admin user created successfully');
    
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    console.log('📝 Use Firebase Console to manually create the user document');
  }
};