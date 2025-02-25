import { motion } from 'framer-motion';
import { Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const EventCard = ({ event, onRegisterClick, children }) => {
  const handleClick = () => {
    if (event.registrationStatus === 'closed') {
      toast.error('Registration is closed for this event. Thank you for your interest!');
      return;
    }
    
    const now = new Date().getTime();
    const deadline = event.registrationDeadline ? new Date(event.registrationDeadline).getTime() : 0;
    
    if (!event.registrationDeadline) {
      toast.error('Registration is not yet open for this event');
      return;
    }

    if (now > deadline) {
      toast.error('Registration deadline has passed for this event');
      return;
    }

    onRegisterClick(event.id);
  };

  const getStatusColor = () => {
    if (!event.registrationDeadline) return 'bg-yellow-100 text-yellow-600';
    if (event.registrationStatus === 'closed') return 'bg-red-100 text-red-600';
    
    const now = new Date().getTime();
    const deadline = new Date(event.registrationDeadline).getTime();
    return now > deadline ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600';
  };

  const getStatusText = () => {
    if (!event.registrationDeadline) return 'Not Open';
    if (event.registrationStatus === 'closed') return 'Closed';
    
    const now = new Date().getTime();
    const deadline = new Date(event.registrationDeadline).getTime();
    return now > deadline ? 'Deadline Passed' : 'Active';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:border-green-500 transition-all duration-300">
      <div className="relative">
        {children}
        <div className={`absolute top-2 right-2 px-3 py-1 ${getStatusColor()} text-sm font-medium rounded-full`}>
          {getStatusText()}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">{event.eventName}</h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4 text-emerald-600" />
            <span className="text-sm">Team Size: {event.teamSize}</span>
          </div>
          {event.registrationDeadline && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span className="text-sm">
                Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span className="text-sm">{event.totalRegistrations || 0} registrations</span>
          </div>
        </div>
        <motion.button
          onClick={handleClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-200 ${
            event.registrationStatus === 'closed' ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          View Details
        </motion.button>
      </div>
    </div>
  );
};

export default EventCard;