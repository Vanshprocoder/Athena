import { Menu, X, User, ClipboardList, FileText, Home, Settings } from 'lucide-react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    
    // Handle clicking outside to close sidebar
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            const sidebar = document.getElementById('sidebar');
            const menuButton = document.getElementById('menu-button');
            
            if (isOpen && 
                sidebar && 
                !sidebar.contains(event.target) && 
                menuButton && 
                !menuButton.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Handle escape key to close sidebar
    React.useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscKey);
        
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen]);

    return (
        <>
            {/* Mobile/Desktop Menu Button */}
            <motion.button 
                id="menu-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`m-4 fixed top-4 right-4 z-50 p-2 rounded-lg !bg-white shadow-lg border border-gray-200 hover:border-emerald-500 transition-all duration-300 ${
                    isOpen ? 'hidden' : 'block'
                }`}
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
            >
                <Menu size={30} className="text-emerald-600" />
            </motion.button>
            
            {/* Overlay - Mobile only */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 !bg-white backdrop-blur-sm md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div 
                id="sidebar"
                className={`fixed top-0 right-0 h-full !bg-white shadow-2xl text-gray-800 w-64 z-40
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex justify-start p-4 border-b border-white-200">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg bg-white hover:bg-gray-200 transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={30} className="text-emerald-600" />
                    </motion.button>
                </div>
                <nav className="h-full">
                    <ul className="space-y-2 p-4">
                        <motion.li whileHover={{ x: 4 }} className="rounded-lg overflow-hidden">
                            <a 
                                href="/admin/dashboard" 
                                className="flex items-center gap-2 px-4 py-3 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 hover:text-white rounded-lg transition-all duration-300"
                                onClick={() => setIsOpen(false)}
                            >
                                <Home size={20} /> Home
                            </a>
                        </motion.li>
                        <motion.li whileHover={{ x: 4 }} className="rounded-lg overflow-hidden">
                            <a 
                                href="/admin/events" 
                                className="flex items-center gap-2 px-4 py-3 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 hover:text-white rounded-lg transition-all duration-300"
                                onClick={() => setIsOpen(false)}
                            >
                                <ClipboardList size={20} /> Events
                            </a>
                        </motion.li>
                        <motion.li whileHover={{ x: 4 }} className="rounded-lg overflow-hidden">
                            <a 
                                href="/admin/registration" 
                                className="flex items-center gap-2 px-4 py-3 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 hover:text-white rounded-lg transition-all duration-300"
                                onClick={() => setIsOpen(false)}
                            >
                                <FileText size={20} /> Registration
                            </a>
                        </motion.li>
                        <motion.li whileHover={{ x: 4 }} className="rounded-lg overflow-hidden">
                            <a 
                                href="/admin/extra-details" 
                                className="flex items-center gap-2 px-4 py-3 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 hover:text-white rounded-lg transition-all duration-300"
                                onClick={() => setIsOpen(false)}
                            >
                                <Settings size={20} /> Extra Details
                            </a>
                        </motion.li>
                    </ul>
                </nav>
            </motion.div>
        </>
    );
};

export default Sidebar;