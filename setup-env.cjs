// setup-env.cjs
const fs = require('fs').promises;
const path = require('path');

const env = `VITE_FIREBASE_API_KEY="AIzaSyA0TIOIcD3SqeEvbcUL8BnQEnvU7uIWoPE"
VITE_FIREBASE_AUTH_DOMAIN="nivora-7f934.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="nivora-7f934"
VITE_FIREBASE_STORAGE_BUCKET="nivora-7f934.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="292804171505"
VITE_FIREBASE_APP_ID="1:292804171505:web:1ded2dea8cabe29967fb50"
VITE_FIREBASE_MEASUREMENT_ID="G-P4DMYFC5MK"
`;

async function createEnvFile() {
  try {
    await fs.writeFile(path.join(__dirname, '.env'), env);
    console.log('✅ Successfully created .env file');
  } catch (error) {
    console.error('❌ Error creating .env file:', error);
  }
}

createEnvFile();
