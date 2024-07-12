import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const result = await axios.post("http://localhost:5000/orders", {
      amount: 10, // amount in rupees
    });

    if (!result) {
      alert("Server error. Are you online?");
      return;
    }

    const { amount, id: order_id, currency } = result.data;

    const options = {
      key: "rzp_test_HSfViGruO1HmgB",
      amount: amount.toString(),
      currency: currency,
      name: "Your Company Name",
      description: "Test Transaction",
      order_id: order_id,
      handler: async function (response) {
        const data = {
          orderCreationId: order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        };

        const result = await axios.post("http://localhost:5000/verify", data);

        if (result.data.success) {
          const userResponse = await axios.post(
            "http://localhost:5000/create_new_user",
            formData
          );
          navigate("/register/success", {
            state: { id: userResponse.data._id },
          });
        } else {
          alert("Payment verification failed. Please try again.");
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#61dafb",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handlePayment();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-gray-200 p-6 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          REGISTER
        </h2>
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
          <button type="submit" className="btn btn-accent">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
