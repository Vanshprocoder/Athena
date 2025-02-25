import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, getDocs, writeBatch, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import Nav from '../Comp/Nav';
import Button from '../Comp/Button';
import { Trophy, Clock, Sparkles } from 'lucide-react';
import EventCard from '../Comp/EventCard';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../Comp/Footer';

const PrizeCard = ({ title, amount, trophyColor }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:border-green-500 transition-all duration-300"
  >
    <div className="p-6 flex flex-col items-center">
      <Trophy size={64} color={trophyColor} className="mb-4" />
      <h3 className="text-xl mt-4 font-semibold text-gray-800">{title}</h3>
      <h3 className="text-xl mt-4 font-semibold text-emerald-600">{amount}</h3>
    </div>
  </motion.div>
);

const Section = ({ title, children, bgColor = "bg-white" }) => (
  <section className={`p-8 ${bgColor} text-center`}>
    <h1 className="text-3xl font-bold text-emerald-600 mb-4">{title}</h1>
    {children}
  </section>
);

const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [prizes, setPrizes] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const navigate = useNavigate();

  const calculateTimeLeft = (deadline) => {
    if (!deadline) return 'Registration not started';
    
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const difference = deadlineTime - now;
    
    if (difference <= 0) {
      return 'Registration Closed';
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };
  };

  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const prizeDoc = await getDoc(doc(db, 'prizes', 'prizeMoney'));
        if (prizeDoc.exists()) {
          setPrizes(prizeDoc.data());
        }
      } catch (error) {
        console.error('Error fetching prize data:', error);
      }
    };

    const fetchEvents = () => {
      setLoading(true);
      setError(null);

      const unsubscribe = onSnapshot(
        query(
          collection(db, 'events'),
          orderBy('createdAt', 'desc')
        ),
        (snapshot) => {
          const eventData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            registrationStatus: doc.data().registrationStatus || 'closed',
            teamSize: doc.data().teamSize || '1',
            totalRegistrations: doc.data().totalRegistrations || 0,
            registrationDeadline: doc.data().registrationDeadline || null,
          }));
          setEvents(eventData);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching events:', error);
          setError('Failed to load events. Please try again later.');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    };

    const fetchSchedule = () => {
      const unsubscribe = onSnapshot(
        query(collection(db, 'schedule')),
        (snapshot) => {
          const scheduleData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSchedule(scheduleData);
        },
        (error) => {
          console.error('Error fetching schedule:', error);
        }
      );

      return () => unsubscribe();
    };

    fetchPrizes();
    fetchEvents();
    fetchSchedule();
  }, []);

  // Get the common deadline and registration status
  const registrationDeadline = events.length > 0 ? events[0].registrationDeadline : null;
  const isRegistrationOpen = events.some(e => e.registrationStatus === 'open');

  // Timer effect
  useEffect(() => {
    let timer;
    if (registrationDeadline) {
      timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(registrationDeadline));
      }, 1000);

      // Initial calculation
      setTimeLeft(calculateTimeLeft(registrationDeadline));
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [registrationDeadline]);

  const handleRegisterClick = (eventId) => {
    navigate(`/event-rules/${eventId}`);
  };

  const renderTimer = () => {
    if (!timeLeft || typeof timeLeft === 'string') {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-emerald-600 mb-4">
            {timeLeft || 'Registration not started'}
          </h2>
        </motion.div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 max-w-4xl mx-auto"
      >
        <h2 className="text-2xl font-bold text-emerald-600 mb-8">Registration Closing In</h2>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 w-24 shadow-lg border border-emerald-100">
            <div className="text-4xl font-bold text-emerald-600 mb-2">{timeLeft.days}</div>
            <div className="text-sm text-gray-600">Days</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 w-24 shadow-lg border border-emerald-100">
            <div className="text-4xl font-bold text-emerald-600 mb-2">{timeLeft.hours}</div>
            <div className="text-sm text-gray-600">Hours</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 w-24 shadow-lg border border-emerald-100">
            <div className="text-4xl font-bold text-emerald-600 mb-2">{timeLeft.minutes}</div>
            <div className="text-sm text-gray-600">Minutes</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 w-24 shadow-lg border border-emerald-100">
            <div className="text-4xl font-bold text-emerald-600 mb-2">{timeLeft.seconds}</div>
            <div className="text-sm text-gray-600">Seconds</div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-emerald-50">
        <Nav />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen min-w-screen bg-[#010528] text-white">
        <Nav />
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-b from-white via-green-50 to-emerald-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),rgba(255,255,255,0))]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl" />
      </div>

      <Nav />

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 container mx-auto px-4 py-20"
      >
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Left side - Image */}
          <div className="w-full md:w-1/2">
            <img 
              src="/src/assets/hero-illustration.svg" 
              alt="Athena Competition Illustration" 
              className="w-full h-auto max-w-[600px] mx-auto"
            />
          </div>

          {/* Right side - Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full md:w-1/2 text-left space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl text-gray-800">WELCOME TO</h2>
              <h1 className="text-5xl font-bold text-emerald-600 flex items-center gap-2">
                ATHENA
                <Sparkles className="h-8 w-8" />
              </h1>
              <p className="text-xl text-gray-600">
                An Inter College Competition
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                text="Register Now" 
                onClick={() => navigate('/register')}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Registration Status */}
      <Section title="Registration Status">
        {renderTimer()}
      </Section>

      {/* Prize Section */}
      <Section title="Exciting Prizes">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <PrizeCard title="First Prize" amount={`₹${prizes.first || 0}`} trophyColor="#FFD700" />
          <PrizeCard title="Second Prize" amount={`₹${prizes.second || 0}`} trophyColor="#C0C0C0" />
          <PrizeCard title="Third Prize" amount={`₹${prizes.third || 0}`} trophyColor="#CD7F32" />
        </div>
      </Section>

      {/* Event Schedule Timeline Section */}
      <Section title="Event Schedule">
        <div className="relative max-w-4xl mx-auto px-4">
          {/* Vertical line */}
          <div className="absolute left-1/2 transform -translate-x-px border-l-2 border-green-500 h-full z-0"></div>
          
          {/* Timeline items */}
          <div className="relative z-10">
            {schedule.map((item, index) => (
              <div 
                key={item.id} 
                className={`flex items-center mb-8 ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}
              >
                {/* Left side (even index) or Right side (odd index) */}
                <div className={`w-1/2 flex ${index % 2 === 0 ? 'justify-end pr-8' : 'justify-start pl-8'}`}>
                  <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 w-full max-w-xs">
                    <h3 className="text-lg font-semibold text-gray-800">{item.activity || "New Activity"}</h3>
                    <p className="text-gray-500 text-sm">{item.date || ""}</p>
                  </div>
                </div>
                
                {/* Center dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-white"></div>
                
                {/* Right side (even index) or Left side (odd index) */}
                <div className={`w-1/2 flex ${index % 2 === 0 ? 'justify-start pl-8' : 'justify-end pr-8'}`}>
                  <div className="text-gray-600">{item.time || (index % 2 === 0 ? "10:00" : "09:00")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Events Section */}
      <Section title="Exciting Events at Athena">
        {events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {events.slice(0, 3).map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:border-green-500 transition-all duration-300"
                >
                  <EventCard 
                    event={event}
                    onRegisterClick={handleRegisterClick}
                  >
                    <img
                      src={event.imageUrl || "https://placehold.co/600x400/f3f4f6/10b981?text=Event"}
                      alt={event.eventName}
                      className="w-full h-64 object-cover"
                    />
                  </EventCard>
                </motion.div>
              ))}
            </div>
            <motion.button
              onClick={() => navigate('/events')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-10 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-200 flex items-center justify-center gap-2 mx-auto"
            >
              View All Events
            </motion.button>
          </>
        ) : (
          <div className="text-gray-600 text-xl">
            No events available at the moment.
          </div>
        )}
      </Section>

      <Footer />
    </div>
  );
};

export default UserDashboard;