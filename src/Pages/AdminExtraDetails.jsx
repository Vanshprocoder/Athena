import React, { useState, useEffect } from 'react';
import { Plus, Settings, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, addDoc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import PrizeCard from '../Comp/PrizeCard';
import ScheduleItem from '../Comp/ScheduleItem';
import Sidebar from '../Comp/Sidebar';
import Logo from '../Comp/Logo';
import Footer from '../Comp/Footer';
const AdminExtraDetails = () => {
  const [prizes, setPrizes] = useState({
    first: 15000,
    second: 10000,
    third: 5000
  });
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      const prizesDoc = await getDoc(doc(db, 'prizes', 'prizeMoney'));
      if (prizesDoc.exists()) {
        setPrizes(prizesDoc.data() || {
          first: 15000,
          second: 10000,
          third: 5000
        });
      } else {
        // Create the document if it doesn't exist
        await setDoc(doc(db, 'prizes', 'prizeMoney'), prizes);
      }

      const scheduleSnapshot = await getDocs(collection(db, 'schedule'));
      const scheduleData = scheduleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSchedule(scheduleData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching details:', error);
      toast.error('Failed to load details');
      setLoading(false);
    }
  };

  const updatePrize = async () => {
    try {
      await setDoc(doc(db, 'prizes', 'prizeMoney'), prizes);
      toast.success('Prize money updated successfully');
    } catch (error) {
      console.error('Error updating prize:', error);
      toast.error('Failed to update prize money');
    }
  };

  const handlePrizeChange = (type, value) => {
    setPrizes(prevPrizes => ({
      ...prevPrizes,
      [type]: value
    }));
  };

  const addScheduleItem = async () => {
    const newItem = {
      time: '09:00',
      activity: 'New Activity'
    };
    try {
      const docRef = await addDoc(collection(db, 'schedule'), newItem);
      setSchedule([...schedule, { id: docRef.id, ...newItem }]);
      toast.success('Schedule item added');
    } catch (error) {
      console.error('Error adding schedule item:', error);
      toast.error('Failed to add schedule item');
    }
  };

  const updateScheduleItem = async (id, time, activity) => {
    try {
      const newSchedule = schedule.map(item => 
        item.id === id ? { ...item, time, activity } : item
      );
      await updateDoc(doc(db, 'schedule', id), { time, activity });
      setSchedule(newSchedule);
      toast.success('Schedule updated successfully');
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  const deleteScheduleItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'schedule', id));
      const newSchedule = schedule.filter(item => item.id !== id);
      setSchedule(newSchedule);
      toast.success('Schedule item deleted');
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      toast.error('Failed to delete schedule item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-b from-white via-green-50 to-emerald-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),rgba(255,255,255,0))]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl" />
      </div>

      <Sidebar />
      <div className="absolute top-4 left-4">
        <Logo />
      </div>

      <div className="p-6 max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center space-y-2 mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="h-7 w-7 text-emerald-600" />
            Extra Details
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </h1>
          <p className="text-gray-600">Manage prize money and event schedule</p>
        </motion.div>
      
        {/* Prize Money Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center gap-2">
            Prize Money
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.keys(prizes).map((key) => (
              <div key={key} className="flex flex-col items-center">
                <label className="text-gray-600">{key.charAt(0).toUpperCase() + key.slice(1)} Prize</label>
                <input
                  type="number"
                  value={prizes[key]}
                  onChange={(e) => handlePrizeChange(key, Number(e.target.value))}
                  className="border border-gray-300 rounded-md p-2 text-black"
                />
              </div>
            ))}
          </div>
          <button
            onClick={updatePrize}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          >
            Update Prizes
          </button>
        </motion.section>

        {/* Schedule Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Event Schedule</h2>
            <motion.button
              onClick={addScheduleItem}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-200"
            >
              <Plus size={16} />
              Add Item
            </motion.button>
          </div>
          <div className="space-y-4">
            {schedule.map((item) => (
              <ScheduleItem
                key={item.id}
                time={item.time}
                activity={item.activity}
                onUpdate={(time, activity) => updateScheduleItem(item.id, time, activity)}
                onDelete={() => deleteScheduleItem(item.id)}
              />
            ))}
            {schedule.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl p-8 text-center border border-gray-200"
              >
                <p className="text-gray-500">No schedule items yet. Add one to get started!</p>
              </motion.div>
            )}
          </div>
        </motion.section>
      </div>
      <Footer/>
    </div>
  );
};

export default AdminExtraDetails; 