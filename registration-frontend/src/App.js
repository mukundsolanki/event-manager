import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ContactForm from './components/ContactForm';
import Success from './components/Success';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<ContactForm />} />
        <Route path="/register/success" element={<Success />} />
      </Routes>
    </Router>
  );
};

export default App;
