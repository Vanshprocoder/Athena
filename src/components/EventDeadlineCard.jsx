import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const EventDeadlineCard = ({ event }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

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

  const handleSetDeadline = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    const deadlineDate = new Date(`${selectedDate}T${selectedTime}`);
    
    try {
      await updateDoc(doc(db, 'events', event.id), {
        registrationDeadline: deadlineDate.toISOString(),
        registrationStatus: 'open'
      });
      setShowDatePicker(false);
    } catch (error) {
      console.error('Error setting deadline:', error);
      alert('Failed to set deadline. Please try again.');
    }
  };

  const handleCloseRegistration = async () => {
    try {
      await updateDoc(doc(db, 'events', event.id), {
        registrationStatus: 'closed'
      });
    } catch (error) {
      console.error('Error closing registration:', error);
      alert('Failed to close registration. Please try again.');
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:border-green-500 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{event.eventName}</h3>
        <div className="flex items-center gap-2">
          {event.registrationStatus === 'open' ? (
            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
              Open
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
              Closed
            </span>
          )}
        </div>
      </div>

      {!event.registrationDeadline && !showDatePicker ? (
        <motion.button
          onClick={() => setShowDatePicker(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-200 flex items-center justify-center gap-2"
        >
          <Calendar className="h-5 w-5" />
          Set Registration Deadline
        </motion.button>
      ) : showDatePicker ? (
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 p-2 bg-white text-gray-800 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
            />
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="flex-1 p-2 bg-white text-gray-800 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <motion.button
              onClick={handleSetDeadline}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-200"
            >
              Set Deadline
            </motion.button>
            <motion.button
              onClick={() => setShowDatePicker(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-300"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-5 w-5 text-emerald-600" />
            <span>Deadline: {new Date(event.registrationDeadline).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle className="h-5 w-5 text-emerald-600" />
            <span>{getRemainingTime(event.registrationDeadline)}</span>
          </div>
          {event.registrationStatus === 'open' && (
            <motion.button
              onClick={handleCloseRegistration}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-200"
            >
              Close Registration
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default EventDeadlineCard; 