const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, address, email, phone } = req.body;

  try {
    const newUser = new User({ name, address, email, phone });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

module.exports = router;
