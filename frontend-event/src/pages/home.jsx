import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Link to="/entry" className="btn">Entry</Link>
      <Link to="/lunch" className="btn ">Lunch</Link>
      <Link to="/dinner" className="btn ">Dinner</Link>
    </div>
  );
}

export default Home;
