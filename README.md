# Edutube - YouTube Course Platform

Edutube is a Next.js application that allows users to create and view YouTube playlists as structured courses with progress tracking, user authentication, and category management.

## Features

- 🔐 **Authentication**: Email/password and Google login via Firebase Auth
- 📚 **Course Management**: Create courses from YouTube playlist URLs
- 📂 **Category System**: Organize courses by categories (Web Development, Cybersecurity, etc.)
- 📊 **Progress Tracking**: Track lesson completion and overall course progress
- 🎥 **YouTube Integration**: Embedded YouTube player with playlist support
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Clean UI**: White-themed interface matching the original prototype

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Firebase Firestore (Database), Firebase Auth (Authentication)
- **External APIs**: YouTube Data API v3
- **Icons**: React Icons

## Setup Instructions

### 1. Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project
- YouTube Data API key

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database
4. Get your Firebase configuration from Project Settings

### 4. YouTube API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Restrict the API key to YouTube Data API v3

### 5. Environment Variables

Update the `.env.local` file in the root directory with your credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# YouTube Data API Key
NEXT_PUBLIC_YOUTUBE_API_KEY=your-youtube-api-key
```

### 6. Firestore Security Rules

Set up these Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Categories - read by all, write by authenticated users
    match /categories/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Courses - read by all, write by authenticated users
    match /courses/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // User Progress - read/write only by the owner
    match /userProgress/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 7. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Creating Courses

1. **Sign up/Login**: Create an account or login with Google
2. **Manage Categories**: Go to "Manage Categories" to create course categories
3. **Create Course**: 
   - Click "Create Course"
   - Enter a YouTube playlist URL
   - Click "Fetch Data" to automatically populate course info
   - Select a category
   - Submit to create the course

### Viewing Courses

1. **Browse**: View all courses on the homepage
2. **Filter**: Use category buttons to filter courses
3. **Watch**: Click on a course to start watching
4. **Track Progress**: Mark lessons as complete to track your progress

### Course Viewer Features

- **Sidebar**: Shows lesson list with completion checkboxes
- **Progress Bar**: Visual progress indicator
- **Navigation**: Previous/Next lesson buttons
- **Auto-advance**: Automatically goes to next lesson when marked complete
- **Toggle Sidebar**: Hide/show sidebar for better viewing experience

## Project Structure

```
edutube_v2/
├── app/
│   ├── auth/
│   │   ├── login/page.js         # Login page
│   │   └── signup/page.js        # Signup page
│   ├── categories/
│   │   └── manage/page.tsx       # Category management
│   ├── courses/
│   │   ├── create/page.tsx       # Course creation
│   │   └── [courseId]/
│   │       └── viewer/page.tsx   # Course viewer
│   ├── components/
│   │   └── Navbar.tsx           # Navigation component
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── contexts/
│   └── AuthContext.js           # Authentication context
├── lib/
│   ├── firebase.js              # Firebase configuration
│   └── firestore.js             # Database operations
├── types/
│   └── index.ts                 # TypeScript interfaces
└── public/                      # Static files
```

## Database Schema

### Collections

1. **categories**
   - `id`: Auto-generated
   - `name`: Category name
   - `description`: Optional description
   - `image`: Category image URL
   - `createdAt`: Timestamp

2. **courses**
   - `id`: Auto-generated
   - `title`: Course title
   - `description`: Course description
   - `playlistUrl`: YouTube playlist URL
   - `categoryId`: Reference to category
   - `thumbnail`: Course thumbnail
   - `videoCount`: Number of videos
   - `videos`: Array of video objects
   - `createdBy`: User ID who created
   - `createdAt`: Timestamp

3. **userProgress**
   - `id`: Auto-generated
   - `userId`: User ID
   - `courseId`: Course ID
   - `videoId`: YouTube video ID
   - `completed`: Boolean
   - `completedAt`: Timestamp

## Getting Started (Development)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

This project is open source and available under the [MIT License](LICENSE).
