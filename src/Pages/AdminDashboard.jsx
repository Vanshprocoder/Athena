import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Activity, 
  Calendar, 
  ClipboardList, 
  X,
  Mail, 
  User,
  Building,
  Clock,
  AlertCircle,
  Pencil,
  Image,
  Upload,
  Download,
  Phone,
  Sparkles
} from "lucide-react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Comp/Sidebar';
import Logo from '../Comp/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import Footer from '../Comp/Footer';
import Nav from '../Comp/Nav';

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg md:max-w-3xl bg-gray-800 rounded-xl shadow-xl">
        {children}
      </div>
    </div>
  );
};

const DeadlineCard = ({ events, onSetDeadline }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Get minimum date (today) in YYYY-MM-DD format
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get minimum time if today is selected
  const getMinTime = () => {
    if (selectedDate === getMinDate()) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '00:00';
  };

  const getRemainingTime = (deadline) => {
    if (!deadline) return 'No deadline set';
    
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
    const now = new Date();

    if (deadlineDate <= now) {
      alert('Please select a future date and time');
      return;
    }

    await onSetDeadline(deadlineDate.toISOString());
    setShowDatePicker(false);
  };

  const commonDeadline = events.length > 0 ? events[0].registrationDeadline : null;
  const now = new Date().getTime();
  const deadlineTime = commonDeadline ? new Date(commonDeadline).getTime() : 0;
  const isOpen = events.some(e => e.registrationStatus === 'open') && commonDeadline && deadlineTime > now;

  const handleCloseRegistration = async () => {
    try {
      const promises = events.map(event => 
        updateDoc(doc(db, 'events', event.id), {
          registrationStatus: 'closed'
        })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error closing registration:', error);
      alert('Failed to close registration. Please try again.');
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-purple-500/20 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">Registration Status</p>
          <div className="flex items-center gap-3 mt-2">
            <h3 className={`text-2xl font-bold ${isOpen ? 'text-green-400' : 'text-red-400'}`}>
              {!commonDeadline ? 'NO DEADLINE SET' : isOpen ? 'OPEN' : 'CLOSED'}
            </h3>
            {commonDeadline && (
              <button
                onClick={() => setShowDatePicker(true)}
                className="p-2 bg-white hover:bg-gray-200 rounded-full transition-colors"
              >
                <Pencil className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-full ${isOpen ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <Activity className={`h-6 w-6 ${isOpen ? 'text-green-400' : 'text-red-400'}`} />
        </div>
      </div>

      {!commonDeadline && !showDatePicker ? (
        <button
          onClick={() => setShowDatePicker(true)}
          className="w-full mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
        >
          <Calendar className="h-5 w-5" />
          Set Deadline
        </button>
      ) : showDatePicker ? (
        <div className="space-y-4 mt-4">
          <div className="flex gap-4">
            <input
              type="date"
              value={selectedDate}
              min={getMinDate()}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                if (e.target.value === getMinDate()) {
                  setSelectedTime(getMinTime());
                }
              }}
              className="flex-1 p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500"
            />
            <input
              type="time"
              value={selectedTime}
              min={selectedDate === getMinDate() ? getMinTime() : undefined}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="flex-1 p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSetDeadline}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Set
            </button>
            <button
              onClick={() => setShowDatePicker(false)}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="h-5 w-5 text-purple-400" />
            <span className="text-sm">Deadline: {new Date(commonDeadline).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <AlertCircle className="h-5 w-5 text-purple-400" />
            <span className="text-sm">{getRemainingTime(commonDeadline)}</span>
          </div>
          {isOpen && (
            <button
              onClick={handleCloseRegistration}
              className="w-full mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Close Registration
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const RegistrationsModal = ({ isOpen, onClose, event }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    if (!event) return;
    
    try {
      const registrationsRef = collection(db, 'registrations');
      const q = query(registrationsRef, where('eventId', '==', event.id));
      const querySnapshot = await getDocs(q);
      const registrationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRegistrations(registrationsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && event) {
      fetchRegistrations();
    }
  }, [isOpen, event]);

  const downloadRegistrations = () => {
    if (!event) return;

    // Create headers
    const headers = [
      "Team Name",
      "College",
      "Team Leader Name",
      "Team Leader Email",
      "Team Leader Phone",
      "Faculty Name",
      "Faculty Email",
      "Faculty Contact",
      "Registration Date"
    ];

    // Create rows
    const rows = registrations.map(reg => [
      reg.teamName,
      reg.college,
      reg.teamLeader.name,
      reg.teamLeader.email,
      reg.teamLeader.phone,
      reg.facultyInCharge,
      reg.facultyEmail,
      reg.facultyContact,
      new Date(reg.registrationDate).toLocaleString()
    ]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths
    const colWidths = headers.map(header => ({
      wch: Math.max(header.length, 15)
    }));
    ws['!cols'] = colWidths;

    // Create workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");

    // Generate Excel file
    XLSX.writeFile(wb, `${event.eventName}_registrations_${new Date().toISOString()}.xlsx`);
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {event.eventName} - Registrations
            <span className="text-sm font-normal text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
              {registrations.length} teams
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {loading ? (
            <div className="min-w-screen flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : registrations.length > 0 ? (
            <div className="space-y-4">
              {registrations.map((reg) => (
                <motion.div
                  key={reg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-emerald-100"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{reg.teamName}</h3>
                      <p className="text-emerald-600">{reg.college}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(reg.registrationDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Team Leader */}
                    <div className="bg-white rounded-lg p-3">
                      <h4 className="text-sm font-medium text-emerald-600 mb-2">Team Leader</h4>
                      <div className="space-y-1">
                        <p className="text-gray-800 flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          {reg.teamLeader.name}
                        </p>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {reg.teamLeader.email}
                        </p>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {reg.teamLeader.phone}
                        </p>
                      </div>
                    </div>

                    {/* Faculty Details */}
                    <div className="bg-white rounded-lg p-3">
                      <h4 className="text-sm font-medium text-emerald-600 mb-2">Faculty Details</h4>
                      <div className="space-y-1">
                        <p className="text-gray-800 flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          {reg.facultyInCharge}
                        </p>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {reg.facultyEmail}
                        </p>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {reg.facultyContact}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Team Members */}
                  {reg.members && reg.members.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-emerald-600 mb-2">Team Members</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {reg.members.map((member, index) => (
                          <div key={index} className="bg-white rounded-lg p-2 border border-emerald-100">
                            <p className="text-gray-800">{member.name}</p>
                            <p className="text-gray-600 text-xs">{member.email}</p>
                            <p className="text-gray-600 text-xs">{member.phone}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No registrations found for this event.
            </div>
          )}
        </div>

        {/* Footer */}
        {registrations.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <motion.button
              onClick={downloadRegistrations}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-200"
            >
              <Download className="h-4 w-4" />
              Download Excel
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState(null);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    // Check authentication from localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userEmail = localStorage.getItem('userEmail');
    const userType = localStorage.getItem('userType');

    if (!isAuthenticated || userType !== 'admin' || !userEmail?.endsWith('@admin.com')) {
      navigate('/login');
      return;
    }

    const unsubscribeEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eventData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventData);
    });

    return () => {
      unsubscribeEvents();
    };
  }, [navigate]);

  const handleSetCommonDeadline = async (deadline) => {
    try {
      const promises = events.map(event => 
        updateDoc(doc(db, 'events', event.id), {
          registrationDeadline: deadline,
          registrationStatus: 'open'
        })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error setting deadline:', error);
      alert('Failed to set deadline. Please try again.');
    }
  };

  const handleImageUpload = async (event, eventId) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if user is authenticated as admin using localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userEmail = localStorage.getItem('userEmail');
    const userType = localStorage.getItem('userType');

    if (!isAuthenticated || userType !== 'admin' || !userEmail?.endsWith('@admin.com')) {
      alert('You must be logged in as an admin to upload images');
      navigate('/login');
      return;
    }

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      
      // Create the storage reference
      const imageRef = ref(storage, `event-images/${eventId}`);
      
      // Upload the file
      await uploadBytes(imageRef, file);
      
      // Get the download URL
      const imageUrl = await getDownloadURL(imageRef);
      
      // Update Firestore with the image URL
      await updateDoc(doc(db, 'events', eventId), {
        imageUrl: imageUrl
      });
      
      setUploading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      let errorMessage = 'Failed to upload image. Please try again.';
      
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'You do not have permission to upload images. Please make sure you are logged in as an admin.';
      } else if (error.code === 'storage/canceled') {
        errorMessage = 'Upload was cancelled. Please try again.';
      } else if (error.code === 'storage/unknown') {
        errorMessage = 'An unknown error occurred. Please try again.';
      }
      
      alert(errorMessage);
      setUploading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (confirmDelete) {
      try {
        // Delete the event from Firestore
        await deleteDoc(doc(db, "events", eventId));

        // Delete the image from Firebase Storage
        const storage = getStorage();
        const imageRef = ref(storage, `event-images/${eventId}`); // Assuming the image is stored with the event ID
        await deleteObject(imageRef);

        alert("Event deleted successfully.");
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event. Please try again.");
      }
    }
  };

  const handleViewRegistrations = (event) => {
    setSelectedEventForRegistrations(event);
    setShowRegistrationsModal(true);
  };

  const handleSetDeadline = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    const deadlineDate = new Date(`${selectedDate}T${selectedTime}`);
    const now = new Date();

    if (deadlineDate <= now) {
      alert('Please select a future date and time');
      return;
    }

    await handleSetCommonDeadline(deadlineDate.toISOString());
    setShowDeadlineModal(false);
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-white via-green-50 to-emerald-50 relative overflow-x-hidden">
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Sidebar />
          <div className="absolute top-4 left-4">
            <Logo />
          </div>
          {/* Header */}
          <div className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-800"
            >
              Admin Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 mt-2"
            >
              Manage your events and registrations
            </motion.p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {/* Total Registrations */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-2">
                    {events.reduce((sum, event) => sum + (event.totalRegistrations || 0), 0)}
                  </h3>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            {/* Registration Status Card */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Registration Status</p>
                  <div className="flex items-center gap-2 mt-2">
                    {events.length > 0 && events[0].registrationDeadline ? (
                      <>
                        <h3 className={`text-2xl font-bold ${new Date(events[0].registrationDeadline) > new Date() ? 'text-emerald-600' : 'text-red-600'}`}>
                          {new Date(events[0].registrationDeadline) > new Date() ? 'ACTIVE' : 'CLOSED'}
                        </h3>
                        <button
                          onClick={() => setShowDeadlineModal(true)}
                          className="p-2 bg-white hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Pencil className="h-5 w-5 text-gray-600" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowDeadlineModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors text-sm font-medium"
                      >
                        Set Deadline
                      </button>
                    )}
                  </div>
                  {events.length > 0 && events[0].registrationDeadline && (
                    <div className="mt-2 text-sm text-gray-500">
                      Deadline: {new Date(events[0].registrationDeadline).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className={`bg-emerald-50 p-3 rounded-full ${
                  events.length > 0 && events[0].registrationDeadline && new Date(events[0].registrationDeadline) > new Date()
                    ? 'bg-emerald-50'
                    : 'bg-red-50'
                }`}>
                  <Activity className={`h-6 w-6 ${
                    events.length > 0 && events[0].registrationDeadline && new Date(events[0].registrationDeadline) > new Date()
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }`} />
                </div>
              </div>
            </motion.div>

            {/* Total Events */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-2">{events.length}</h3>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Events Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Events List
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Event Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Total Registrations</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">View List</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <motion.tr 
                      key={event.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.5)' }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">{event.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{event.eventName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {event.imageUrl ? (
                          <div className="relative group">
                            <img 
                              src={event.imageUrl} 
                              alt={event.eventName}
                              className="w-12 h-12 object-cover rounded-lg cursor-pointer"
                            />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer">
                              <Upload className="h-5 w-5 text-white" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, event.id)}
                                disabled={uploading}
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                            <Image className="h-5 w-5 text-gray-400" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, event.id)}
                              disabled={uploading}
                            />
                          </label>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{event.totalRegistrations || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <button
                          onClick={() => handleViewRegistrations(event)}
                          className="p-2 bg-white hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <ClipboardList className="h-5 w-5 text-gray-600" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

            </div>
          </motion.div>

          {/* Custom Modal */}
          <Modal 
            isOpen={!!selectedEvent} 
            onClose={() => setSelectedEvent(null)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  {selectedEvent?.eventName} - Registrations
                </h2>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              
              <div className="mt-4">
                {selectedEvent?.registrations?.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-purple-400" />
                            Name
                          </div>
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-purple-400" />
                            College
                          </div>
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-purple-400" />
                            Email
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEvent?.registrations.map((registration) => (
                        <tr key={registration.id} className="border-b border-gray-700">
                          <td className="px-4 py-2 text-sm text-gray-300">{registration.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-300">{registration.college}</td>
                          <td className="px-4 py-2 text-sm text-gray-300">{registration.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-300">No registrations yet.</p>
                )}
              </div>
            </div>
          </Modal>

          {/* Add the Registrations Modal */}
          <RegistrationsModal
            isOpen={showRegistrationsModal}
            onClose={() => setShowRegistrationsModal(false)}
            event={selectedEventForRegistrations}
          />

          {/* Deadline Modal */}
          <AnimatePresence>
            {showDeadlineModal && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              >
                <motion.div 
                  className="absolute inset-0 bg-black/20"
                  onClick={() => setShowDeadlineModal(false)}
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 p-6"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Set Registration Deadline</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          if (e.target.value === new Date().toISOString().split('T')[0]) {
                            const now = new Date();
                            const minTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                            if (selectedTime < minTime) {
                              setSelectedTime(minTime);
                            }
                          }
                        }}
                        className="w-full p-3 bg-white text-gray-800 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Time</label>
                      <input
                        type="time"
                        value={selectedTime}
                        min={selectedDate === new Date().toISOString().split('T')[0] ? 
                          `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}` : 
                          undefined}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full p-3 bg-white text-gray-800 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      onClick={() => setShowDeadlineModal(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSetDeadline}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors"
                    >
                      Set Deadline
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Footer className="m-0 p-0 w-full" />
      </div>
    </div>
  );
};

export default AdminDashboard;
