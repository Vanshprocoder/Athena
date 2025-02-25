import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="block">
      <img 
        src="../src/assets/logo3.png" 
        alt="PCTE Logo"
        className="h-20 w-auto object-contain"
      />
    </Link>
  );
};

export default Logo;
