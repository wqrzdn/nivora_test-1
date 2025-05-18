# Cloudinary Setup for Nivora

This guide will help you set up Cloudinary for image handling in the Nivora application.

## Why Cloudinary?

Cloudinary offers several advantages over Firebase Storage for image handling:

1. **Optimized Image Delivery**: Automatic optimization of images for different devices and network conditions
2. **Image Transformations**: Easily resize, crop, and apply effects to images on-the-fly
3. **CDN Distribution**: Global content delivery network for faster loading times
4. **Better Performance**: Reduced bandwidth usage and improved page load times
5. **Advanced Features**: Face detection, automatic tagging, and more

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com/) and sign up for a free account
2. After signing up, you'll be taken to your dashboard where you can find your account details

### 2. Get Your Cloudinary Credentials

From your Cloudinary dashboard, note down the following information:
- Cloud Name
- API Key
- API Secret

### 3. Create an Upload Preset

1. In your Cloudinary dashboard, go to Settings > Upload
2. Scroll down to "Upload presets"
3. Click "Add upload preset"
4. Name it `nivora_preset` (or choose your own name)
5. Set the mode to "Unsigned" for frontend uploads
6. Configure other settings as needed (folder structure, transformations, etc.)
7. Save the preset

### 4. Update Environment Variables

Update the `.env` file in your project with your Cloudinary credentials:

```
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_API_SECRET=your-api-secret
VITE_CLOUDINARY_UPLOAD_PRESET=nivora_preset
```

Replace the placeholder values with your actual Cloudinary credentials.

### 5. Restart Your Application

After updating the environment variables, restart your application for the changes to take effect.

## Testing Your Setup

To test if Cloudinary is working correctly:

1. Go to the Property Form page
2. Upload a new property image
3. Check the browser console for Cloudinary upload success messages
4. Verify that the image URL in the console contains `cloudinary.com`

## Troubleshooting

If you encounter issues with Cloudinary uploads:

1. **CORS Issues**: Ensure your Cloudinary account has the correct CORS settings
2. **Upload Preset**: Verify that the upload preset name matches exactly
3. **Environment Variables**: Double-check that your environment variables are correctly set
4. **Console Errors**: Check the browser console for specific error messages

For more help, refer to the [Cloudinary Documentation](https://cloudinary.com/documentation).
