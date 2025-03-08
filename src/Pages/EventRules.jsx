import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ArrowLeft, Calendar, Users, Clock, Sparkles } from "lucide-react";
import Nav from '../Comp/Nav';
import { motion } from 'framer-motion';
import Footer from "../Comp/Footer";
const EventRules = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() });
        } else {
          navigate("/events"); // Redirect if event not found
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-gray-800 text-xl">Event not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-white via-green-50 to-emerald-50 relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),rgba(255,255,255,0))]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl" />
      </div>

      <Nav />
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate("/events")}
          whileHover={{ x: -5 }}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Events
        </motion.button>

        {/* Event Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-lg"
        >
          <h1 className="text-3xl font-bold text-gray-800 text-left mb-4 flex items-center gap-2">
            {event.eventName}
            <Sparkles className="h-6 w-6 text-emerald-600" />
          </h1>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-5 w-5 text-emerald-600" />
              <span>Team Size: {event.teamSize}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <span>Last Date: {new Date(event.lastDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-5 w-5 text-emerald-600" />
              <span>Created: {new Date(event.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Rules Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Rules</h2>
          <div className="prose prose-emerald max-w-none">
            <p className="text-gray-600 text-left whitespace-pre-wrap">{event.rules}</p>
          </div>
        </motion.div>

        {/* Registration Button */}
        <div className="flex justify-center">
          <motion.button
            onClick={() => navigate(`/register`)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-200"
          >
            Register for Event
          </motion.button>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default EventRules; 