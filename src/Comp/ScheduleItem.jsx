import React, { useState } from 'react';
import { Clock, Pencil, Check, X, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from './Footer';

const ScheduleItem = ({ time, activity, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTime, setEditTime] = useState(time);
  const [editActivity, setEditActivity] = useState(activity);

  const handleSave = () => {
    onUpdate(editTime, editActivity);
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl p-4 border border-gray-200 hover:border-green-500 transition-all duration-300"
    >
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Time</label>
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Activity</label>
            <input
              type="text"
              value={editActivity}
              onChange={(e) => setEditActivity(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-black"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleSave}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-black">{time}</p>
              <p className="text-base text-gray-800">{activity}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg transition-colors"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
       
        </div>
      )}
    </motion.div>
  );
};

export default ScheduleItem; 