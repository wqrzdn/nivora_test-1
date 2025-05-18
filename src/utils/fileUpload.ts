import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Uploads a file to Firebase Storage and returns the download URL
 * @param file File to upload
 * @param path Storage path where the file should be stored
 * @param onProgress Optional callback for upload progress
 * @returns Promise with the download URL
 */
export const uploadFile = (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      console.error('No file provided for upload');
      reject(new Error('No file provided for upload'));
      return;
    }

    try {
      // Create a unique file name with timestamp to avoid collisions
      const timestamp = new Date().getTime();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_'); // Remove special chars
      const fileName = `${timestamp}_${safeFileName}`;
      
      // Create storage reference
      const storageRef = ref(storage, `${path}/${fileName}`);
      console.log(`Uploading file to ${path}/${fileName}`);
      
      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate and report progress if callback provided
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
            console.log(`Upload progress: ${progress.toFixed(2)}%`);
          }
        },
        (error) => {
          // Handle errors
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          // Upload completed successfully, get download URL
          try {
            console.log('Upload completed, getting download URL');
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Download URL obtained:', downloadURL);
            resolve(downloadURL);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(error);
          }
        }
      );
    } catch (error) {
      console.error('Error starting upload:', error);
      reject(error);
    }
  });
};

/**
 * Uploads multiple files to Firebase Storage and returns an array of download URLs
 * @param files Array of files to upload
 * @param path Storage path where the files should be stored
 * @param onProgress Optional callback for overall upload progress
 * @returns Promise with an array of download URLs
 */
export const uploadMultipleFiles = async (
  files: File[],
  path: string,
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  const uploadPromises = [];
  const totalFiles = files.length;
  let completedFiles = 0;

  for (const file of files) {
    const uploadPromise = uploadFile(
      file,
      path,
      (fileProgress) => {
        // Calculate overall progress if callback provided
        if (onProgress) {
          const fileContribution = fileProgress / totalFiles;
          const overallProgress = (completedFiles / totalFiles) * 100 + fileContribution;
          onProgress(overallProgress);
        }
      }
    ).then((url) => {
      completedFiles++;
      return url;
    });

    uploadPromises.push(uploadPromise);
  }

  return Promise.all(uploadPromises);
};
