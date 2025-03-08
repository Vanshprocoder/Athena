import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Download, 
  Search,
  Filter,
  Mail, 
  Phone,
  Building,
  Calendar,
  X,
  Sparkles,
  Pencil,
  Trash2
} from "lucide-react";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Comp/Sidebar';
import Logo from '../Comp/Logo';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../Comp/Footer';
const AdminRegistrations = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    college: '',
    event: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userEmail = localStorage.getItem('userEmail');
    const userType = localStorage.getItem('userType');

    if (!isAuthenticated || userType !== 'admin' || !userEmail?.endsWith('@admin.com')) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      // Fetch all registrations
      const registrationsSnapshot = await getDocs(collection(db, 'registrations'));
      const registrationsData = registrationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRegistrations(registrationsData);

      // Extract unique colleges and events
      const uniqueColleges = new Set(registrationsData.map(reg => reg.college));
      setColleges(Array.from(uniqueColleges).sort());

      const uniqueEvents = new Set(registrationsData.map(reg => reg.eventName));
      setEvents(Array.from(uniqueEvents).sort());

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesCollege = !filters.college || reg.college === filters.college;
    const matchesEvent = !filters.event || reg.eventName === filters.event;
    const matchesSearch = !filters.search || 
      reg.teamName.toLowerCase().includes(filters.search.toLowerCase()) ||
      reg.teamLeader.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      reg.teamLeader.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      reg.college.toLowerCase().includes(filters.search.toLowerCase());

    return matchesCollege && matchesEvent && matchesSearch;
  });

  const downloadRegistrations = () => {
    // Find maximum team size among all registrations
    const maxTeamSize = Math.max(...filteredRegistrations.map(reg => reg.teamSize));

    // Create headers for dynamic number of team members
    const baseHeaders = [
      "Event Name",
      "College",
      "Team Name",
      "Team Size",
      "Team Leader Name",
      "Team Leader Email",
      "Team Leader Phone",
      "Faculty Name",
      "Faculty Email",
      "Faculty Contact",
      "Registration Date"
    ];

    // Add headers for maximum possible team members
    const memberHeaders = [];
    for (let i = 1; i <= maxTeamSize - 1; i++) {
      memberHeaders.push(
        `Member ${i} Name`,
        `Member ${i} Email`,
        `Member ${i} Phone`
      );
    }

    const headers = [...baseHeaders, ...memberHeaders];

    // Create rows with proper data formatting
    const rows = filteredRegistrations.map(reg => {
      // Base data
      const baseData = [
        reg.eventName,
        reg.college,
        reg.teamName,
        reg.teamSize,
        reg.teamLeader.name,
        reg.teamLeader.email,
        reg.teamLeader.phone,
        reg.facultyInCharge,
        reg.facultyEmail,
        reg.facultyContact,
        new Date(reg.registrationDate).toLocaleString()
      ];

      // Member data with NA for missing members
      const memberData = [];
      for (let i = 0; i < maxTeamSize - 1; i++) {
        if (i < reg.members.length) {
          memberData.push(
            reg.members[i].name,
            reg.members[i].email,
            reg.members[i].phone
          );
        } else {
          memberData.push("NA", "NA", "NA");
        }
      }

      return [...baseData, ...memberData];
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths
    const colWidths = headers.map(header => ({
      wch: Math.max(header.length, 15)
    }));
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");

    // Generate Excel file
    XLSX.writeFile(wb, `registrations_${new Date().toISOString()}.xlsx`);
  };

  const clearFilters = () => {
    setFilters({
      college: '',
      event: '',
      search: ''
    });
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-white via-green-50 to-emerald-50 relative overflow-x-hidden">
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
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            Registrations
            <Sparkles className="h-5 w-5 text-green-600" />
          </h1>
          <p className="text-gray-600 mt-2">View and manage all event registrations</p>
        </div>

        {/* Filters and Actions */}
        <motion.div 
          className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 mb-8"
          whileHover={{ y: -5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search registrations..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                />
              </div>
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white rounded-xl hover:bg-gray-100 transition-all duration-300 relative"
              >
                <Filter className="h-5 w-5 text-gray-600" />
                {(filters.college || filters.event) && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full" />
                )}
              </motion.button>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <motion.button
                onClick={clearFilters}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors bg-white"
              >
                Clear Filters
              </motion.button>
              <motion.button
                onClick={downloadRegistrations}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 !bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300"
              >
                <Download className="h-4 w-4" />
                Export Excel
              </motion.button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">College</label>
                  <select
                    value={filters.college}
                    onChange={(e) => setFilters(prev => ({ ...prev, college: e.target.value }))}
                    className="w-full p-2 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                  >
                    <option value="">All Colleges</option>
                    {colleges.map((college, index) => (
                      <option key={index} value={college}>{college}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Event</label>
                  <select
                    value={filters.event}
                    onChange={(e) => setFilters(prev => ({ ...prev, event: e.target.value }))}
                    className="w-full p-2 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                  >
                    <option value="">All Events</option>
                    {events.map((event, index) => (
                      <option key={index} value={event}>{event}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Registrations List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"
              />
            </div>
          ) : filteredRegistrations.length > 0 ? (
            <AnimatePresence>
              {filteredRegistrations.map((reg, index) => (
                <motion.div 
                  key={reg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 space-y-4 border border-gray-200 hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <h3 className="text-lg font-medium text-gray-800">{reg.eventName}</h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{reg.college}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                      Team: {reg.teamName}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Team Leader */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-green-600 mb-2">Team Leader</h4>
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
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-green-600 mb-2">Faculty Details</h4>
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
                  {reg.members.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-green-600 mb-2">Team Members</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {reg.members.map((member, index) => (
                          <div key={index} className="bg-white rounded p-2 text-sm border border-gray-100">
                            <p className="text-gray-800">{member.name}</p>
                            <p className="text-gray-600 text-xs">{member.email}</p>
                            <p className="text-gray-600 text-xs">{member.phone}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Registered on: {new Date(reg.registrationDate).toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              No registrations found.
            </motion.div>
          )}
        </div>
      </motion.div>
      <Footer/>
    </div>
  );
};

export default AdminRegistrations; 