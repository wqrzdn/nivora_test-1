/**
 * Cloudinary Upload Utility
 * 
 * This utility provides functions for uploading images to Cloudinary,
 * which offers better image optimization, transformations, and delivery
 * compared to Firebase Storage.
 *
 * NOTE: Make sure you have created an upload preset in your Cloudinary dashboard
 * with the name 'nivora_preset' and set it to 'Unsigned' mode.
 * 
 * IMPORTANT: This file uses Vite environment variables (import.meta.env.VITE_*)
 * Make sure your .env file has the correct Cloudinary credentials.
 */

// Function to upload a single file to Cloudinary
export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);
    
    // Use the correct environment variable format for Vite
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'nivora_preset';
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'nivora_properties');
    
    // Add timestamp to prevent caching issues
    formData.append('timestamp', String(Date.now()));
    
    // Log for debugging
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);
    console.log('Using upload preset:', uploadPreset);
    
    // Make the upload request to Cloudinary
    // Use the exact cloud name from your .env file
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'do4iktwnj';
    console.log('Using Cloudinary cloud name:', cloudName);
    
    // Use the correct Cloudinary API endpoint
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    console.log('Uploading to URL:', uploadUrl);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      // No headers needed for FormData
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error response:', errorText);
      throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Cloudinary upload successful:', data);
    
    // Ensure we're using the secure URL
    if (!data.secure_url) {
      console.error('No secure_url in Cloudinary response', data);
      throw new Error('Cloudinary response missing secure_url');
    }
    
    // Return the secure URL of the uploaded image
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Function to upload multiple files to Cloudinary
export const uploadMultipleToCloudinary = async (
  files: File[],
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  try {
    const totalFiles = files.length;
    const uploadPromises: Promise<string>[] = [];
    let completedUploads = 0;
    
    // Process each file
    for (const file of files) {
      const uploadPromise = uploadToCloudinary(file).then(url => {
        completedUploads++;
        
        // Calculate and report progress if callback provided
        if (onProgress) {
          const progress = Math.round((completedUploads / totalFiles) * 100);
          onProgress(progress);
        }
        
        return url;
      });
      
      uploadPromises.push(uploadPromise);
    }
    
    // Wait for all uploads to complete
    return Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple files to Cloudinary:', error);
    throw error;
  }
};

// Function to generate a Cloudinary URL with transformations
export const getOptimizedImageUrl = (url: string, width: number = 800, quality: number = 80): string => {
  if (!url) {
    console.error('Empty URL passed to getOptimizedImageUrl');
    return ''; // Return empty string for null/undefined URLs
  }
  
  // Handle non-Cloudinary URLs gracefully
  if (!url.includes('cloudinary.com')) {
    console.log('Non-Cloudinary URL detected:', url);
    return url; // Return original URL if not a Cloudinary URL
  }
  
  try {
    // Parse the URL to insert transformation parameters
    const parts = url.split('/upload/');
    if (parts.length !== 2) {
      console.warn('Invalid Cloudinary URL format:', url);
      return url;
    }
    
    // Create optimized URL with transformations
    const optimizedUrl = `${parts[0]}/upload/w_${width},q_${quality},f_auto/${parts[1]}`;
    console.log('Generated optimized URL:', optimizedUrl);
    return optimizedUrl;
  } catch (error) {
    console.error('Error generating optimized URL:', error);
    return url; // Return original URL in case of any error
  }
};
