import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Nav from '../Comp/Nav';
import { AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '../Comp/Footer';
const EventRegistrationForm = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    college: '',
    teamName: '',
    facultyInCharge: '',
    facultyContact: '',
    facultyEmail: '',
    teamLeader: {
      name: '',
      email: '',
      phone: ''
    },
    members: []
  });

  // Fetch events and colleges from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events
        const eventsCollection = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Check if any events are open for registration
        const hasOpenEvents = eventsData.some(event => {
          const now = new Date().getTime();
          const deadline = event.registrationDeadline ? new Date(event.registrationDeadline).getTime() : 0;
          return event.registrationStatus === 'open' && deadline > now;
        });

        if (!hasOpenEvents) {
          toast.error('No events are currently open for registration');
          navigate('/events');
          return;
        }

        setEvents(eventsData.filter(event => {
          const now = new Date().getTime();
          const deadline = event.registrationDeadline ? new Date(event.registrationDeadline).getTime() : 0;
          return event.registrationStatus === 'open' && deadline > now;
        }));

        // Fetch unique colleges from existing registrations
        const registrationsCollection = collection(db, 'registrations');
        const registrationsSnapshot = await getDocs(registrationsCollection);
        const uniqueColleges = new Set();
        registrationsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.college) uniqueColleges.add(data.college);
        });
        setColleges(Array.from(uniqueColleges).sort());
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data. Please try again.');
      }
    };

    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamLeaderChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      teamLeader: {
        ...prev.teamLeader,
        [name]: value
      }
    }));
  };

  const handleMemberChange = (index, e) => {
    const { name, value } = e.target;
    const newMembers = [...formData.members];
    if (!newMembers[index]) {
      newMembers[index] = { name: '', email: '', phone: '' };
    }
    newMembers[index][name] = value;
    setFormData(prev => ({ ...prev, members: newMembers }));
  };

  const addMember = () => {
    if (formData.members.length < (selectedEvent?.teamSize - 1 || 3)) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, { name: '', email: '', phone: '' }]
      }));
    }
  };

  const removeMember = (index) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.college) return 'Please select or enter your college name';
    if (!selectedEvent) return 'Please select an event';
    if (!formData.teamName) return 'Please enter a team name';
    if (!formData.teamLeader.name || !formData.teamLeader.email || !formData.teamLeader.phone)
      return 'Please fill all team leader details';
    
    const totalMembers = formData.members.length + 1;
    if (totalMembers < selectedEvent.teamSize) 
      return `Team must have exactly ${selectedEvent.teamSize} members for this event`;
    
    for (const member of formData.members) {
      if (!member.name || !member.email || !member.phone)
        return 'Please fill all member details';
    }

    const emails = new Set([formData.teamLeader.email, ...formData.members.map(m => m.email)]);
    if (emails.size !== totalMembers) return 'Each team member must have a unique email';

    return '';
  };

  const checkTeamLimit = async () => {
    try {
      const registrationsRef = collection(db, 'registrations');
      const q = query(
        registrationsRef,
        where('college', '==', formData.college),
        where('eventId', '==', selectedEvent.id)
      );
      const querySnapshot = await getDocs(q);
      const currentTeams = querySnapshot.size;
      const maxTeams = selectedEvent.maxTeamsPerCollege || 2; // Default to 2 if not set
      return currentTeams < maxTeams;
    } catch (error) {
      console.error('Error checking team limit:', error);
      throw new Error('Failed to check team limit');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading('Processing registration...');

    try {
      if (!selectedEvent) {
        toast.error('Please select an event', { id: toastId });
        setLoading(false);
        return;
      }

      // Check registration deadline
      const now = new Date().getTime();
      const deadline = selectedEvent.registrationDeadline ? new Date(selectedEvent.registrationDeadline).getTime() : 0;
      
      if (!selectedEvent.registrationDeadline) {
        toast.error('Registration is not yet open for this event', { id: toastId });
        setLoading(false);
        return;
      }

      if (now > deadline) {
        toast.error('Registration deadline has passed for this event', { id: toastId });
        setLoading(false);
        return;
      }

      if (selectedEvent.registrationStatus !== 'open') {
        toast.error('Registration is currently closed for this event', { id: toastId });
        setLoading(false);
        return;
      }

      // Validate form
      const validationError = validateForm();
      if (validationError) {
        toast.error(validationError, { id: toastId });
        setLoading(false);
        return;
      }

      // Check team limit
      const canRegister = await checkTeamLimit();
      if (!canRegister) {
        const maxTeams = selectedEvent.maxTeamsPerCollege || 2;
        toast.error(`Maximum team limit reached for your college (${maxTeams} teams per college)`, { id: toastId });
        setLoading(false);
      return;
    }

      // Create registration
      const registrationData = {
          ...formData,
        eventId: selectedEvent.id,
        eventName: selectedEvent.eventName,
        registrationDate: new Date().toISOString(),
        teamSize: formData.members.length + 1,
        status: 'registered'
      };

      const docRef = await addDoc(collection(db, 'registrations'), registrationData);

      // Update event's total registrations
      const eventRef = doc(db, 'events', selectedEvent.id);
      await updateDoc(eventRef, {
        totalRegistrations: (selectedEvent.totalRegistrations || 0) + 1
      });

      toast.success('Registration successful!', { id: toastId });
      navigate('/');
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('Failed to register. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-white via-green-50 to-emerald-50 relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),rgba(255,255,255,0))]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl" />
      </div>

      <Nav />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          Event Registration
          <Sparkles className="h-6 w-6 text-emerald-600" />
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Selection */}
          <motion.div 
            className="bg-white backdrop-blur-xl p-6 rounded-xl shadow-lg border border-gray-200"
            whileHover={{ boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)" }}
          >
            <h2 className="text-2xl text-gray-800 mb-4 font-semibold">Select Event</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    selectedEvent?.id === event.id
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                      : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200'
                  }`}
                >
                  <h3 className="font-medium">{event.eventName}</h3>
                  <p className={`text-sm mt-1 ${selectedEvent?.id === event.id ? 'text-white' : 'text-gray-600'}`}>
                    Team Size: {event.teamSize}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* College and Team Details */}
          <motion.div 
            className="bg-white backdrop-blur-xl p-6 rounded-xl shadow-lg border border-gray-200 space-y-4"
            whileHover={{ boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)" }}
          >
            <h2 className="text-2xl text-gray-800 mb-4 font-semibold">College & Team Details</h2>
            
            {/* College Selection */}
            <div className="space-y-2">
              <label className="block text-gray-600 font-medium">College Name</label>
              <input
                list="colleges"
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                className="w-full p-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                placeholder="Select or type your college name"
                required
              />
              <datalist id="colleges">
                {colleges.map((college, index) => (
                  <option key={index} value={college} />
                ))}
              </datalist>
            </div>

            {/* Team Name */}
            <div className="space-y-2">
              <label className="block text-gray-600 font-medium">Team Name</label>
              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleInputChange}
                className="w-full p-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                required
              />
            </div>

            {/* Faculty Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-gray-600 font-medium">Faculty In-charge</label>
                <input
                  type="text"
                  name="facultyInCharge"
                  value={formData.facultyInCharge}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-600 font-medium">Faculty Contact</label>
                <input
                  type="tel"
                  name="facultyContact"
                  value={formData.facultyContact}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-gray-600 font-medium">Faculty Email</label>
                <input
                  type="email"
                  name="facultyEmail"
                  value={formData.facultyEmail}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                  required
                />
              </div>
            </div>
          </motion.div>

          {/* Team Members */}
          <motion.div 
            className="bg-white backdrop-blur-xl p-6 rounded-xl shadow-lg border border-gray-200 space-y-6"
            whileHover={{ boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)" }}
          >
            <h2 className="text-2xl text-gray-800 mb-4 font-semibold">Team Details</h2>
            
            {/* Team Leader */}
            <div className="space-y-4">
              <h3 className="text-lg text-gray-800">Team Leader</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.teamLeader.name}
                    onChange={handleTeamLeaderChange}
                    className="w-full p-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.teamLeader.email}
                    onChange={handleTeamLeaderChange}
                    className="w-full p-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.teamLeader.phone}
                    onChange={handleTeamLeaderChange}
                    className="w-full p-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg text-gray-800">Team Members</h3>
                {formData.members.length < (selectedEvent?.teamSize - 1 || 3) && (
                  <button
                    type="button"
                    onClick={addMember}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-200"
                  >
                    Add Member
                  </button>
                )}
              </div>

              {formData.members.map((member, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, e)}
                      className="w-full p-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, e)}
                      className="w-full p-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={member.phone}
                      onChange={(e) => handleMemberChange(index, e)}
                      className="w-full p-3 bg-white text-gray-800 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl transition-all duration-300 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-200'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registering...
                </span>
              ) : (
                'Submit Registration'
              )}
            </motion.button>
          </div>
        </form>
        </motion.div>
        <Footer/>
    </div>
  );
};

export default EventRegistrationForm;