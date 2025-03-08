// import React, { useState, useEffect } from "react";
// import { getFirestore, collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot } from "firebase/firestore";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { Calendar, Plus, Pencil, Trash2, ClipboardList, Menu, Upload } from "lucide-react";
// import { app } from "../firebaseConfig";
// import Sidebar from "../Comp/Sidebar";


import React, { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { Calendar, Plus, Pencil, Trash2, ClipboardList, Menu, Image, Download, Users, Mail, Phone, Sparkles, X } from "lucide-react";
import { db } from "../firebase";
import Sidebar from "../Comp/Sidebar";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes, deleteObject, getDownloadURL } from "firebase/storage";
import ImageUploadModal from '../Comp/ImageUploadModal';
import Logo from '../Comp/Logo';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../Comp/Footer';
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

  if (!isOpen) return null;
  if (!event) return null;

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
            <div className="flex items-center justify-center py-12">
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
                    <div className="bg-white rounded-lg p-3 border border-emerald-100">
                      <h4 className="text-sm font-medium text-emerald-600 mb-2">Team Leader</h4>
                      <div className="space-y-1">
                        <p className="text-gray-800">{reg.teamLeader.name}</p>
                        <p className="text-gray-600 text-sm">{reg.teamLeader.email}</p>
                        <p className="text-gray-600 text-sm">{reg.teamLeader.phone}</p>
                      </div>
                    </div>

                    {/* Faculty */}
                    <div className="bg-white rounded-lg p-3 border border-emerald-100">
                      <h4 className="text-sm font-medium text-emerald-600 mb-2">Faculty Details</h4>
                      <div className="space-y-1">
                        <p className="text-gray-800">{reg.facultyInCharge}</p>
                        <p className="text-gray-600 text-sm">{reg.facultyEmail}</p>
                        <p className="text-gray-600 text-sm">{reg.facultyContact}</p>
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

const AdminEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
      eventName: "",
      rules: "",
      teamSize: "",
      maxTeamsPerCollege: "2" // Default value
    });
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
    const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState(null);

    useEffect(() => {
      // Check authentication using localStorage
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const userEmail = localStorage.getItem('userEmail');

      if (!isAuthenticated || !userEmail?.endsWith('@admin.com')) {
        navigate('/login');
        return;
      }

      const unsubscribeEvents = onSnapshot(collection(db, "events"), (snapshot) => {
        const eventData = snapshot.docs.map((doc, index) => ({ 
          id: doc.id,
          sequentialId: index + 1,
          ...doc.data() 
        }));
        setEvents(eventData);
      });

      return () => {
        unsubscribeEvents();
      };
    }, [navigate]);

    const handleInputChange = (e) => {
      setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
    };

    const handleSaveEvent = async () => {
      const toastId = toast.loading('Saving event...');
      try {
        if (!newEvent.eventName || !newEvent.rules || !newEvent.teamSize || !newEvent.maxTeamsPerCollege) {
          toast.error('All fields are required!', { id: toastId });
          return;
        }
        
        const eventData = {
          ...newEvent,
          teamSize: Number(newEvent.teamSize),
          maxTeamsPerCollege: Number(newEvent.maxTeamsPerCollege),
          updatedAt: new Date().toISOString(),
          registrationStatus: "open",
          registrationDeadline: null
        };

        if (editingEvent) {
          await updateDoc(doc(db, "events", editingEvent.id), eventData);
          toast.success('Event updated successfully!', { id: toastId });
        } else {
          await addDoc(collection(db, "events"), {
            ...eventData,
            createdAt: new Date().toISOString(),
            totalRegistrations: 0
          });
          toast.success('Event created successfully!', { id: toastId });
        }
        
        setShowModal(false);
        setNewEvent({ 
          eventName: "", 
          rules: "", 
          teamSize: "", 
          maxTeamsPerCollege: "2" 
        });
        setEditingEvent(null);
      } catch (error) {
        console.error("Error saving event:", error);
        toast.error('Failed to save event. Please try again.', { id: toastId });
      }
    };

    const handleEditEvent = (event) => {
      setEditingEvent(event);
      setNewEvent({ ...event });
      setShowModal(true);
    };

    const handleDeleteEvent = async (eventId) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this event?");
      if (confirmDelete) {
        const toastId = toast.loading('Deleting event...');
        try {
          // Delete the event from Firestore
          await deleteDoc(doc(db, "events", eventId));

          // Delete the image from Firebase Storage
          const storage = getStorage();
          const imageRef = ref(storage, `event-images/${eventId}`);
          await deleteObject(imageRef);

          toast.success('Event deleted successfully!', { id: toastId });
        } catch (error) {
          console.error("Error deleting event:", error);
          toast.error('Failed to delete event. Please try again.', { id: toastId });
        }
      }
    };

    const handleImageUpload = async (event, eventId) => {
      const file = event.target.files[0];
      if (!file) return;

      setUploading(true);
      const toastId = toast.loading('Uploading image...');
      const storage = getStorage();
      const imageRef = ref(storage, `event-images/${eventId}`);

      try {
        // Upload the file
        await uploadBytes(imageRef, file);
        
        // Get the download URL
        const imageUrl = await getDownloadURL(imageRef);

        // Update Firestore with the new image URL
        await updateDoc(doc(db, 'events', eventId), {
          imageUrl: imageUrl
        });

        toast.success('Image uploaded successfully!', { id: toastId });
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error('Failed to upload image. Please try again.', { id: toastId });
      } finally {
        setUploading(false);
      }
    };

    const handleViewRegistrations = (event) => {
      setSelectedEventForRegistrations(event);
      setShowRegistrationsModal(true);
    };

    return (
      <div className="min-h-screen min-w-screen bg-gradient-to-b from-white via-green-50 to-emerald-50 relative overflow-x-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),rgba(255,255,255,0))]" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100/50 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl" />
        </div>

        <Sidebar/>
        <div className="absolute top-4 left-4">
          <Logo />
        </div>
        <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center space-y-2"
          >
            <div className="flex flex-col items-center w-full text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                <Calendar className="h-6 w-6 md:h-7 md:w-7 text-green-600" />
                Event Management
                <Sparkles className="h-5 w-5 text-green-600" />
              </h1>
            
            </div>
            <p className="text-gray-600 text-sm md:text-base">Create and manage your events</p>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            className="group bg-white rounded-xl border border-gray-200 shadow-lg p-4 md:p-6 hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1 w-full md:w-auto">
                <h3 className="text-base md:text-lg font-semibold text-gray-800">Total Events: {events.length}</h3>
                <h3 className="text-base md:text-lg font-semibold text-gray-800">Registrations Open: {events.length}</h3>
              </div>
              <motion.button
                onClick={() => setShowModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 text-white shadow-lg shadow-green-200"
              >
                <Plus className="h-5 w-5" /> Add Event
              </motion.button>
            </div>
          </motion.div>

          {/* Events Table */}
          <motion.div 
            className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Events List
              </h2>
            </div>
            
            {/* Mobile View */}
            <div className="md:hidden">
              <AnimatePresence>
                {events.map((event, index) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border-b border-gray-200 hover:bg-green-50/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-300">{event.eventName}</h3>
                        <p className="text-sm text-gray-400">ID: {event.sequentialId}</p>
                      </div>
                      <span className="text-sm text-gray-300">
                        {event.totalRegistrations} registrations
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <motion.button
                        onClick={() => handleEditEvent(event)}
                        className="p-2 bg-white hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Pencil className="h-5 w-5 text-green-600" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 bg-white hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleViewRegistrations(event)}
                        className="p-2 bg-white hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <ClipboardList className="h-5 w-5 text-green-600" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Event Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Total Registrations</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {events.map((event, index) => (
                      <motion.tr 
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-green-50/50 transition-all duration-300"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">{event.sequentialId}</td>
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">{event.eventName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {event.imageUrl ? (
                            <motion.img 
                              src={event.imageUrl} 
                              alt={event.eventName} 
                              className="w-12 h-12 object-cover rounded-xl"
                              whileHover={{ scale: 1.1 }}
                            />
                          ) : (
                            <motion.label 
                              className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition-all duration-300"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Image className="h-5 w-5 text-gray-400" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, event.id)}
                              />
                            </motion.label>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{event.totalRegistrations}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => handleEditEvent(event)}
                              whileHover={{ scale: 1.1 }}
                              className="p-2 bg-white hover:bg-gray-200 rounded-xl transition-all duration-300"
                            >
                              <Pencil className="h-5 w-5 text-green-600" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteEvent(event.id)}
                              whileHover={{ scale: 1.1 }}
                              className="p-2 bg-white hover:bg-gray-200 rounded-xl transition-all duration-300"
                            >
                              <Trash2 className="h-5 w-5 text-red-500" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleViewRegistrations(event)}
                              whileHover={{ scale: 1.1 }}
                              className="p-2 bg-white hover:bg-gray-200 rounded-xl transition-all duration-300"
                            >
                              <ClipboardList className="h-5 w-5 text-green-600" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Add/Edit Event Modal */}
          <AnimatePresence>
            {showModal && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              >
                <motion.div 
                  className="absolute inset-0 bg-black/20"
                  onClick={() => setShowModal(false)}
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 p-4 md:p-6 max-h-[90vh] overflow-y-auto"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    {editingEvent ? "Edit Event" : "Add Event"}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Event Name</label>
                      <input
                        type="text"
                        name="eventName"
                        placeholder="Event Name"
                        value={newEvent.eventName}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-white text-gray-800 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Rules</label>
                      <textarea
                        name="rules"
                        placeholder="Event Rules"
                        value={newEvent.rules}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full p-3 bg-white text-gray-800 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Team Size</label>
                        <input
                          type="number"
                          name="teamSize"
                          placeholder="Team Size"
                          min="1"
                          max="10"
                          value={newEvent.teamSize}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-white text-gray-800 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Max Teams per College</label>
                        <input
                          type="number"
                          name="maxTeamsPerCollege"
                          placeholder="Max Teams"
                          min="1"
                          max="5"
                          value={newEvent.maxTeamsPerCollege}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-white text-gray-800 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse md:flex-row justify-end gap-4 mt-6">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEvent}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image Upload Modal */}
          <ImageUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            eventId={selectedEventId}
            onImageUploaded={handleImageUpload}
          />

          {/* Registrations Modal */}
          <RegistrationsModal
            isOpen={showRegistrationsModal}
            onClose={() => setShowRegistrationsModal(false)}
            event={selectedEventForRegistrations}
          />
        </div>
        <Footer/>
      </div>
    );
};

export default AdminEvents;
