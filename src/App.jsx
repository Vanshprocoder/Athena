import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Login from './Pages/Login';
import AdminDashboard from './Pages/AdminDashboard';
import UserDashboard from './Pages/UserDashboard';
import AdminEvents from './Pages/AdminEvents';
import AdminRegistrations from './Pages/AdminRegistrations';
import AdminExtraDetails from './Pages/AdminExtraDetails';
import Events from './Pages/Events';
import EventRules from './Pages/EventRules';
import EventRegistrationForm from './Pages/EventRegistrationForm';
import Rules from './Pages/Rules';

const App = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eventData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: 'white',
            },
          },
          loading: {
            style: {
              background: '#3B82F6',
              color: 'white',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<UserDashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event-rules/:eventId" element={<EventRules />} />
        <Route path="/register" element={<EventRegistrationForm events={events} />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/registration" element={<AdminRegistrations />} />
        <Route path="/admin/extra-details" element={<AdminExtraDetails />} />
        <Route path="/rules" element={<Rules />} />
      </Routes>
    </Router>
  );
};

export default App;