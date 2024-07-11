import React, { useState } from 'react';
import axios from 'axios';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/users', formData);
      console.log('Form submitted:', response.data);
    } catch (error) {
      console.error('Error submitting form', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-200 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">REGISTER</h2>
        <div className="form-control mb-4">
          <label className="label" htmlFor="name">
            <span className="label-text text-black">Name</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input input-bordered w-full bg-gray-100"
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="form-control mb-4">
          <label className="label" htmlFor="address">
            <span className="label-text text-black">Address</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="input input-bordered w-full bg-gray-100"
            placeholder="Enter your address"
            required
          />
        </div>
        <div className="form-control mb-4">
          <label className="label" htmlFor="email">
            <span className="label-text text-black">Email</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input input-bordered w-full bg-gray-100"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-control mb-4">
          <label className="label" htmlFor="phone">
            <span className="label-text text-black">Phone Number</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input input-bordered w-full bg-gray-100"
            placeholder="Enter your phone number"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="btn btn-accent"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
