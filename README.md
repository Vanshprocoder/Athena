# Athena - Inter College Competition Platform

## Overview
Athena is a comprehensive web platform for managing inter-college competitions. Built with React and Firebase, it provides a seamless experience for both participants and administrators.

## Features
- User Authentication
- Event Registration System
- Real-time Updates
- Admin Dashboard
- Prize Management
- Schedule Management
- Registration Tracking
- Responsive Design

## Tech Stack
- React.js
- Firebase (Authentication, Firestore, Storage)
- Tailwind CSS
- Framer Motion
- Vite

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation
1. Clone the repository
```bash
git clone [your-repo-url]
cd athena
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the development server
```bash
npm run dev
```

## Project Structure
```
src/
├── Comp/           # Reusable components
├── Pages/          # Page components
├── assets/         # Static assets
├── firebase.js     # Firebase configuration
└── App.jsx         # Main application component
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
Your Name - your.email@example.com
Project Link: [https://github.com/yourusername/athena](https://github.com/yourusername/athena)
