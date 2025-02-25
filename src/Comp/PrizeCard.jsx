import React, { useState } from 'react';
import { Trophy, Pencil, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const PrizeCard = ({ position, amount, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(Number(amount) || 0);

  const formatAmount = (value) => {
    return `₹${Number(value).toLocaleString('en-IN')}`;
  };

  const handleSave = () => {
    onUpdate(Number(editAmount));
    setIsEditing(false);
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:border-green-500 transition-all duration-300"
    >
      <div className="p-6 flex flex-col items-center">
        <Trophy 
          size={64} 
          color={position === "First" ? "#FFD700" : position === "Second" ? "#C0C0C0" : "#CD7F32"} 
          className="mb-4" 
        />
        <h3 className="text-xl font-semibold text-gray-800">{position} Prize</h3>
        
        {isEditing ? (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-gray-600">₹</span>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="w-24 px-2 py-1 border border-gray-200 rounded-md focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            />
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:bg-green-50 rounded-full transition-colors"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2">
            <h3 className="text-xl font-semibold text-emerald-600">{formatAmount(amount)}</h3>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
            >
              <Pencil size={16} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PrizeCard; 