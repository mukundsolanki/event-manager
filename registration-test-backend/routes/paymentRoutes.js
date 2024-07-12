const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: 'rzp_test_HSfViGruO1HmgB',
  key_secret: 'NZcFST0SrzTBmNDC3pQg5nqA',
});

router.post('/orders', async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100,
    currency: 'INR',
    receipt: 'receipt_order_74394',
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/verify', async (req, res) => {
  const { orderCreationId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

  const shasum = crypto.createHmac('sha256', 'NZcFST0SrzTBmNDC3pQg5nqA');
  shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
  const digest = shasum.digest('hex');

  if (digest === razorpaySignature) {
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
});

module.exports = router;
