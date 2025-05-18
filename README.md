# Nivora - Property Rental & Roommate Matching

Nivora is a web application that connects property owners with potential tenants and helps tenants find compatible roommates.

## Features

### Owner Features
- Create and manage property listings
- View applications from potential tenants
- Chat with interested tenants
- Generate rental agreements

### Tenant Features
- Search for properties with advanced filters
- Find compatible roommates
- Apply for rental properties
- Chat with property owners

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Authentication:** Firebase Auth
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **Maps:** Mapbox
- **Real-time Chat:** Firebase Realtime Database

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/nivora.git
cd nivora
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

4. Start the development server:
```
npm run dev
```

## Project Structure

```
nivora/
├── public/            # Static files
├── src/
│   ├── assets/        # Images, icons, etc.
│   ├── components/    # Reusable UI components
│   ├── config/        # Configuration files
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # API and service functions
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main App component
│   ├── index.css      # Global styles
│   └── main.tsx       # Entry point
├── .env               # Environment variables (not committed)
├── index.html         # HTML template
├── package.json       # Dependencies and scripts
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Mapbox](https://www.mapbox.com/)
- [Lucide Icons](https://lucide.dev/)