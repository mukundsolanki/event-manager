const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/scan', (req, res) => {
  const scannedValue = req.query.value;
  const responseData = {
    name: 'Mukund Solanki',
    scannedValue: scannedValue,
  };
  
  res.json(responseData);
});

app.post('/accept', (req, res) => {
  console.log('Accepted');
  res.send('Accepted');
});

app.post('/reject', (req, res) => {
  console.log('Rejected');
  res.send('Rejected');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
