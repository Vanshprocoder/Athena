import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, AlertCircle, Sparkles } from "lucide-react";
import Nav from '../Comp/Nav';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { motion } from 'framer-motion';
import Footer from '../Comp/Footer';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsubscribeEvents = onSnapshot(collection(db, "events"), (snapshot) => {
      const eventData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventData);
    });

    return () => {
      unsubscribeEvents();
    };
  }, []);

  const getRemainingTime = (deadline) => {
    if (!deadline) return null;
    
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const difference = deadlineTime - now;
    
    if (difference <= 0) {
      return 'Registration Closed';
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m remaining`;
  };

  const handleRegisterClick = (eventId) => {
    navigate(`/event-rules/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-emerald-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),rgba(255,255,255,0))]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl" />
      </div>

      <Nav />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
            Available Events
            <Sparkles className="h-6 w-6 text-emerald-600" />
          </h1>
          <p className="text-gray-600">Discover and register for exciting events</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:border-green-500 transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={event.imageUrl || "https://placehold.co/600x400/f3f4f6/10b981?text=Event"}
                  alt={event.eventName}
                  className="w-full h-48 object-cover"
                />
                {event.registrationStatus === 'closed' && (
                  <div className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                    Closed
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{event.eventName}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm">Team Size: {event.teamSize}</span>
                  </div>
                  {event.registrationDeadline && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">{getRemainingTime(event.registrationDeadline)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <AlertCircle className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm">{event.totalRegistrations || 0} registrations</span>
                  </div>
                </div>

                <motion.button
                  onClick={() => handleRegisterClick(event.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-200"
                >
                  View Details
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No events available at the moment.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Events; 