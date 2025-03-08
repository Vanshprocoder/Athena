import React, { useEffect, useState } from 'react';
import { Facebook, Instagram } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import logo from '/logo3.png';

const Footer = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eventData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          {/* Logo and Contact Info */}
          <div className="mb-6 md:mb-0 text-left">
            <img src="/logo_bk1.png" alt="Logo" className="h-20" />
            <p className="mt-2">0161 - 2888500</p>
            <p>Campus-1, Baddowal, Ferozepur Road, Ludhiana-142021, Punjab, India</p>
            <p>Campus-2, Near Baddowal Cantt, Ferozepur Road, Ludhiana-142021, Punjab, India</p>
            <p>Email: <a href="mailto:info@pcte.edu.in" className="text-emerald-400">info@pcte.edu.in</a></p>
            <div className="flex space-x-4 mt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-6 w-6 text-gray-300 hover:text-emerald-400" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-6 w-6 text-gray-300 hover:text-emerald-400" />
              </a>
            </div>
          </div>

          {/* Events */}
          <div className="mb-6 md:mb-0 text-left">
            <h4 className="font-bold text-green-500">Events</h4>
            <ul className="list-disc list-inside">
              {events.map(event => (
                <li key={event.id}>{event.eventName}</li>
              ))}
            </ul>
          </div>

          {/* Useful Links */}
          <div className="mb-6 md:mb-0 text-left">
            <h4 className="font-bold text-green-500">Useful Links</h4>
            <ul className="list-disc list-inside">
              <li><a href="/" className="text-emerald-400">Home</a></li>
              <li><a href="/events" className="text-emerald-400">Events</a></li>
              <li><a href="/rules" className="text-emerald-400">Rules</a></li>
              <li><a href="/register" className="text-emerald-400">Register</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800 text-left">
          <p className="text-gray-400">© {new Date().getFullYear()} PCTE Group. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
