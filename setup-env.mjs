import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Your Firebase configuration
const env = `VITE_FIREBASE_API_KEY="replace_with_your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="replace_with_your_auth_domain"
VITE_FIREBASE_PROJECT_ID="replace_with_your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="replace_with_your_storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="replace_with_your_messaging_sender_id"
VITE_FIREBASE_APP_ID="replace_with_your_app_id"
`;

try {
  await writeFile(join(__dirname, '.env'), env);
  console.log('Successfully created .env file');
} catch (error) {
  console.error('Error creating .env file:', error);
} 