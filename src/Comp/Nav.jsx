import { Home, Calendar, Info, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Nav = () => (
  <nav className="bg-white border-b border-gray-200 shadow-sm">
    <div className="container mx-auto flex justify-between items-center px-4">
      <div className="flex-shrink-0">
        <img src="../src/assets/logo3.png" className="h-20" alt="Logo" />
      </div>
      
      <ul className="flex items-center gap-6">
        <motion.li whileHover={{ y: -2 }} className="flex items-center gap-1">
          <Link to="/" className="flex items-center gap-1 !text-green-600 hover:text-emerald-600 transition-colors">
            <Home size={20} />
            Home
          </Link>
        </motion.li>
        <motion.li whileHover={{ y: -2 }} className="flex items-center gap-1">
          <Link to="/events" className="flex items-center gap-1 !text-green-600 hover:text-emerald-600 transition-colors">
            <Calendar size={20} />
            Events
          </Link>
        </motion.li>
        <motion.li whileHover={{ y: -2 }} className="flex items-center gap-1">
          <Link to="/rules" className="flex items-center gap-1 !text-green-600 hover:text-emerald-600 transition-colors">
            <Info size={20} />
            Rules
          </Link>
        </motion.li>
        <motion.li whileHover={{ y: -2 }} className="flex items-center gap-1">
          <Link to="/register" className="flex items-center gap-1 !text-green-600 hover:text-emerald-600 transition-colors">
            <LogIn size={20} />
            Register
          </Link>
        </motion.li>
      </ul>
    </div>
  </nav>
);

export default Nav;