import React from 'react';
import Nav from '../Comp/Nav';
import Footer from '../Comp/Footer';

const Rules = () => {
  return (
    <div className="h-screen w-screen bg-gradient-to-b from-white via-green-50 to-emerald-50 relative overflow-x-hidden">
      <Nav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">General Rules</h1>
        <ol className="list-decimal list-inside space-y-4 text-gray-700 text-left">
          <li>Students from any stream can participate.</li>
          <li>Registration has to be done at the college level.</li>
          <li>Students can participate in multiple events also.</li>
          <li>Registration will be done as per the rules.</li>
          <li>
            Participation fee is only for the Hackathon event i.e., Rs.200/ per student and no participation fees for any other event of Athena.
          </li>
          <li>
            Cash prizes for the Hackathon winners.
            <ul className="list-disc list-inside font-bold pl-6">
              <li>First Prize: ₹ 10,000/</li>
              <li>Second Prize: ₹ 5,000/</li>
              <li>Third Prize: ₹ 2,500/</li>
            </ul>
          </li>
          <li>All the participants will get certificates.</li>
          <li>Trophies will be given to the first 3 winners of all the events.</li>
          <li>
            Based on the maximum points scored, there will be an Overall Trophy awarded to that particular college/institute/university.
          </li>
          <li>Each entry must be approved by the respective director/principal or competent authority.</li>
          <li>Only students currently on roll are permitted. Outside professionals, former students are not allowed.</li>
          <li>Theme/program/topic will be provided on the spot.</li>
        </ol>
      </div>
      <Footer />
    </div>
  );
};

export default Rules;
