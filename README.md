<div align="center">

# 🏠 Nivora

### Modern Property Rental & Roommate Matching Platform

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-11.6.0-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-6.3.2-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

<p align="center">
  <img src="https://via.placeholder.com/800x400?text=Nivora+App+Screenshot" alt="Nivora App Screenshot" width="800">
</p>

</div>

## 📋 Overview

Nivora is a comprehensive property rental and roommate matching platform designed to streamline the rental process for both property owners and tenants. With an intuitive interface and powerful features, Nivora makes it easy to list, search, and manage properties while facilitating communication between all parties.

### 🌟 Key Features

#### For Property Owners
- **Property Management** - Create, edit, and manage property listings with detailed information and multiple images
- **Application Tracking** - Review and manage tenant applications in one place
- **Messaging System** - Communicate directly with potential tenants
- **Document Generation** - Create rental agreements and other important documents
- **Service Provider Integration** - Connect with maintenance and service providers

#### For Tenants
- **Advanced Search** - Find properties with detailed filters for location, price, amenities, and more
- **Roommate Matching** - Find compatible roommates based on preferences and lifestyle
- **Application Management** - Apply for properties and track application status
- **Favorites** - Save and organize properties of interest
- **In-app Messaging** - Communicate with property owners and potential roommates

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Firebase account (for authentication and database)
- Mapbox account (for maps integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nivora.git
   cd nivora
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application running.

## 📱 Mobile Responsiveness

Nivora is designed to work seamlessly across all devices - from desktop to mobile. The responsive design ensures that users have a great experience regardless of their device.

<div align="center">
  <img src="https://via.placeholder.com/250x500?text=Mobile+View" alt="Mobile View" width="250">
  <img src="https://via.placeholder.com/250x500?text=Tablet+View" alt="Tablet View" width="250">
  <img src="https://via.placeholder.com/250x500?text=Desktop+View" alt="Desktop View" width="250">
</div>

## 🏗️ Project Structure

```
nivora/
├── public/                # Static files
├── src/
│   ├── assets/            # Images, icons, etc.
│   ├── components/        # Reusable UI components
│   │   ├── ui/            # Basic UI components
│   │   ├── layout/        # Layout components
│   │   ├── forms/         # Form components
│   │   └── profile/       # Profile-related components
│   ├── config/            # Configuration files
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API and service functions
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main App component
│   ├── index.css          # Global styles
│   └── main.tsx           # Entry point
├── .env                   # Environment variables (not committed)
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **Lucide React** - Icon library

### Backend & Services
- **Firebase Authentication** - User authentication
- **Firebase Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **Firebase Realtime Database** - Real-time messaging
- **Mapbox** - Maps and location services
- **Cloudinary** - Image optimization and management

## 🤝 Contributing

We welcome contributions to Nivora! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines
- Follow the existing code style and conventions
- Write tests for new features
- Keep pull requests focused on a single feature or bug fix
- Document your code and any new functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Mapbox](https://www.mapbox.com/)
- [Cloudinary](https://cloudinary.com/)
- [Lucide Icons](https://lucide.dev/)
- [Vite](https://vitejs.dev/)

---

<div align="center">

**[Website](#)** • **[Documentation](#)** • **[Report Bug](../../issues)** • **[Request Feature](../../issues)**

</div>