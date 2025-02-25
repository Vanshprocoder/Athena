import { motion } from 'framer-motion';
import Button from "./Button";
import TimerUnit from "./TimerUnit";

const Countdown = ({ days, hours, minutes }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 max-w-4xl mx-auto"
  >
    <h2 className="text-2xl font-bold text-emerald-600 mb-8">Registration Closing Soon!</h2>
    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
      <TimerUnit value={days} label="Days" />
      <TimerUnit value={hours} label="Hours" />
      <TimerUnit value={minutes} label="Minutes" />
    </div>
    <motion.div className="mt-8" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button text="Register Now" />
    </motion.div>
  </motion.div>
);

export default Countdown;