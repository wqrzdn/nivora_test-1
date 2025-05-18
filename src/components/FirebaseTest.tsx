import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadFile } from '../utils/fileUpload';

const FirebaseTest: React.FC = () => {
  const { user, loginWithGoogle } = useAuth();
  const [testMessage, setTestMessage] = useState<string>('');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setTestStatus('loading');
      setTestMessage('Attempting Google Sign-In...');
      await loginWithGoogle();
      setTestStatus('success');
      setTestMessage('Google Sign-In successful!');
    } catch (error: any) {
      console.error('Google Sign-In test failed:', error);
      setTestStatus('error');
      setTestMessage(`Google Sign-In failed: ${error.message}`);
    }
  };

  // Test Firestore Read/Write
  const testFirestore = async () => {
    if (!user) {
      setTestStatus('error');
      setTestMessage('Please sign in first to test Firestore operations');
      return;
    }

    try {
      setTestStatus('loading');
      setTestMessage('Testing Firestore operations...');

      // Create a test document
      const testDocRef = doc(db, 'test', user.id);
      await setDoc(testDocRef, {
        timestamp: new Date(),
        message: 'Test document created successfully',
      });

      // Read the test document
      const docSnapshot = await getDoc(testDocRef);
      if (docSnapshot.exists()) {
        setTestStatus('success');
        setTestMessage('Firestore read/write test successful!');
      } else {
        throw new Error('Document was not created successfully');
      }
    } catch (error: any) {
      console.error('Firestore test failed:', error);
      setTestStatus('error');
      setTestMessage(`Firestore operations failed: ${error.message}`);
    }
  };

  // Test Firebase Storage
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      setTestStatus('error');
      setTestMessage('Please select a file and sign in first');
      return;
    }

    try {
      setTestStatus('loading');
      setTestMessage('Uploading image to Firebase Storage...');
      setUploadProgress(0);

      // Upload the file
      const downloadUrl = await uploadFile(
        file,
        `test/${user.id}`,
        (progress) => setUploadProgress(progress)
      );

      // Set the image URL
      setImageUrl(downloadUrl);
      setTestStatus('success');
      setTestMessage('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Storage test failed:', error);
      setTestStatus('error');
      setTestMessage(`Image upload failed: ${error.message}`);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-lg mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Firebase Integration Test</h2>

      {/* Authentication Test */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">1. Authentication Test</h3>
        <div className="flex items-center justify-between">
          <div>
            {user ? (
              <div className="text-green-600 font-medium">
                ✅ Signed in as {user.email}
              </div>
            ) : (
              <div className="text-gray-600">Not signed in</div>
            )}
          </div>
          {!user && (
            <button
              onClick={handleGoogleSignIn}
              className="btn btn-primary"
              disabled={testStatus === 'loading'}
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      {/* Firestore Test */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">2. Firestore Test</h3>
        <button
          onClick={testFirestore}
          className="btn btn-primary w-full"
          disabled={!user || testStatus === 'loading'}
        >
          Test Firestore Read/Write
        </button>
      </div>

      {/* Storage Test */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">3. Storage Test</h3>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <button
          onClick={triggerFileInput}
          className="btn btn-primary w-full mb-4"
          disabled={!user || testStatus === 'loading'}
        >
          Upload Test Image
        </button>

        {testStatus === 'loading' && uploadProgress > 0 && (
          <div className="mt-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1 text-center">
              {uploadProgress.toFixed(0)}% uploaded
            </p>
          </div>
        )}

        {imageUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Uploaded Image:</p>
            <img
              src={imageUrl}
              alt="Uploaded test"
              className="w-full h-48 object-cover rounded-md"
            />
          </div>
        )}
      </div>

      {/* Test Status */}
      {testMessage && (
        <div
          className={`p-4 rounded-md mt-4 ${testStatus === 'error' ? 'bg-red-100 text-red-700' : testStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
        >
          {testStatus === 'loading' && (
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {testMessage}
            </div>
          )}
          {testStatus !== 'loading' && testMessage}
        </div>
      )}
    </div>
  );
};

export default FirebaseTest;
