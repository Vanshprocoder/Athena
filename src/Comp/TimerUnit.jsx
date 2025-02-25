import { motion } from 'framer-motion';

const TimerUnit = ({ value, label }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 w-24 shadow-lg border border-emerald-100"
  >
    <div className="text-4xl font-bold text-emerald-600 mb-2">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </motion.div>
);

export default TimerUnit;