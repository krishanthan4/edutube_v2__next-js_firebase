// Utility functions for handling image uploads to public folder instead of Firebase Storage

/**
 * Upload image to public folder
 * @param file - Image file to upload
 * @param folder - Subfolder in public directory (e.g., 'guidance-images', 'profile-images')
 * @returns Promise<string> - Relative URL to the uploaded image
 */
export const uploadImageToPublic = async (
  file: File,
  folder: string
): Promise<string> => {
  try {
    // Create FormData for the file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    // Make API call to upload endpoint
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const result = await response.json();
    return result.url; // Returns relative path like '/guidance-images/filename.jpg'
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Delete image from public folder
 * @param imagePath - Relative path to the image
 * @returns Promise<boolean> - Success status
 */
export const deleteImageFromPublic = async (imagePath: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/delete-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imagePath }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Generate unique filename
 * @param originalName - Original file name
 * @returns string - Unique filename with timestamp
 */
export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(`.${extension}`, '').replace(/[^a-zA-Z0-9]/g, '-');
  return `${timestamp}-${nameWithoutExt}.${extension}`;
};

/**
 * Validate image file
 * @param file - File to validate
 * @returns boolean - Whether file is valid
 */
export const validateImageFile = (file: File): boolean => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed');
  }
  
  return true;
};