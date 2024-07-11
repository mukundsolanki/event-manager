const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
const { MongoClient } = require("mongodb");
const moment = require('moment');
var ObjectId = require('mongodb').ObjectId;
const nodemailer = require("nodemailer");
const qr = require('qr-image');
const fs = require('fs');
const { Storage } = require("@google-cloud/storage");
const { Readable } = require('readable-stream')
const eventDates = [10, 11, 12];
require('dotenv').config();
//This is MongoDB URI
const uri = process.env.URI;
//This is GC storage Bucket access code
const storage = new Storage({
  projectId: process.env.GC_PROJECT_ID,
  keyFilename: process.env.GC_KEYFILE_NAME,
});
const client = new MongoClient(String(uri));

const uploadToFirebaseStorage = async (data, fileName) => {
  try {
    // Generate QR code buffer
    const qrBuffer = qr.imageSync(data, { type: 'png' });

    // Create a readable stream from the buffer
    const stream = new Readable();
    stream.push(qrBuffer);
    stream.push(null); // Indicates the end of the stream

    const gcs = storage.bucket("stellarqr");
    const storagePath = `storage_folder/${fileName}`;

    const file = gcs.file(storagePath);

    // Create a write stream to Firebase Storage
    const writeStream = file.createWriteStream({
      predefinedAcl: 'publicRead', // Set the file to be publicly readable
      metadata: {
        contentType: 'image/png', // Adjust the content type as needed
      }
    });

    // Pipe the readable stream to the write stream
    stream.pipe(writeStream);

    // Return a promise that resolves when the upload is complete
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
}
async function runQR(data, fileName) {
  let result = await uploadToFirebaseStorage(data, fileName);
  return result;
}

async function sendMail(data) {
  return new Promise((resolve, reject) => {
    nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
      },
    }).sendMail({
      from: process.env.USER_EMAIL,
      to: data.email,
      subject: "Your Confirmation for the 41st M.P. State Ophthalmic Conference 2024 in Bhopal",
      text:
        `Dear ${data.name},

We are delighted to confirm your registration for the 41st M.P. State Ophthalmic Conference 2024, which will be held in Bhopal from 15-08-24 to 18-08-24.

Please find below your unique QR code, which will serve as your digital pass for entry and e-verification at various events, including lunch, dinner, and other sessions.

QR Code:

[QR placeholder]

To ensure a smooth and hassle-free experience, kindly follow these instructions:

QR Code Usage: Present this QR code at the registration desk for entry. It will also be required for access to lunch, dinner, and other designated areas.
Conference Schedule: Detailed conference schedules and session information will be available on our website and the conference app.
WhatsApp Confirmation: You will also receive a confirmation message on your registered WhatsApp number. Please keep it handy for reference.
If you have any questions or require further assistance, please do not hesitate to contact us at tempmail54321003@gmail.com.

We look forward to welcoming you to an enriching and inspiring event.

Best regards,

Stellar Events
41st M.P. State Ophthalmic Conference 2024 Bhopal
`,
      html: `<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>
    Your Confirmation for the 41st M.P. State Ophthalmic Conference 2024 in
    Bhopal
  </title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    h2 {
      color: #333;
    }
    .qr-code {
      margin: 20px 0;
      text-align: center;
    }
    .qr-code img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <p>Dear ${data.name},</p>
  <p>
    We are delighted to confirm your registration for the 41st M.P. State
    Ophthalmic Conference 2024, which will be held in Bhopal from 15-08-24
    to 18-08-24.
  </p>
  <div class="qr-code">
    <img src="${data.qr}" alt="QR Code"/>
  </div>
  <p>
    To ensure a smooth and hassle-free experience, kindly follow these
    instructions:
  </p>
  <ol>
    <li>
      <strong>QR Code Usage:</strong> Present this QR code at the registration
      desk for entry. It will also be required for access to lunch, dinner,
      and other designated areas.
    </li>
    <li>
      <strong>Conference Schedule:</strong> Detailed conference schedules and
      session information will be available on our website and the conference
      app.
    </li>
    <li>
      <strong>WhatsApp Confirmation:</strong> You will also receive a
      confirmation message on your registered WhatsApp number. Please keep it
      handy for reference.
    </li>
  </ol>
  <p>
    If you have any questions or require further assistance, please do not
    hesitate to contact us at
    <a href="mailto:tempmail54321003@gmail.com">tempmail54321003@gmail.com</a>.
  </p>
  <p>We look forward to welcoming you to an enriching and inspiring event.</p>
  <p>
    Best regards,<br />
    Stellar Events<br />
    Organizing Team<br />
    41st M.P. State Ophthalmic Conference 2024 Bhopal<br />
  </p>
</body>
</html>
`
    }, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
        resolve(false);
      } else {
        console.log("Email sent: ", info.response);
        resolve(true);
      }
    });
  });
}

async function createUser(receivedData) {
  try {
    await client.connect();
    //address, email, phone
    const database = client.db('sample_mflix');
    const users = database.collection('users');
    const userName = receivedData.name;
    const dateKey = moment().format('YYYYMMDD');
    const timeKey = moment().format('HHmmssSSS');
    const nameKey = userName.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const formatedDate = moment().format('DD-MM-YYYY');
    const formatedTime = moment().format('HH:mm:ss');
    const key = nameKey + dateKey + timeKey;
    const slot = 2; //receivedData.slot;
    let checks = {};
    checks.entry = false;
    for (let i = 0; i < slot; i++) {
      checks[`breakfast${eventDates[i]}`] = false;
      checks[`lunch${eventDates[i]}`] = false;
      checks[`dinner${eventDates[i]}`] = false;
    }
    checks.name = userName;
    checks.date = formatedDate;
    checks.time = formatedTime;
    checks.email = receivedData.email;
    checks.phone = receivedData.phone;
    checks.address = receivedData.address;
    // checks.key = key;
    checks._id = key;
    checks.qr = `https://storage.googleapis.com/stellarqr/storage_folder/${key}`
    const result = await users.insertOne(checks);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
    await client.close();
    try {
      runQR(String(key), String(key));
      console.log(`Image Saved in bucket at URL https://storage.googleapis.com/stellarqr/storage_folder/${key}`)
    } catch (error) {
      console.log("Error in storing qr: ", error);
      return false;
    }
    try {
      sendMail(checks);
      console.log("Mail Sent")
    } catch (error) {
      console.log("Error in sending email: ", error)
      return false;
    }
    return true;
  } catch (error) {
    console.log(error)
    await client.close();
    return false;
  }
}

async function getName(id_val) {
  try {
    await client.connect();
    const database = client.db('sample_mflix');
    const users = database.collection('users');
    user = await users.findOne({ _id: id_val });
    if (user == null) {
      await client.close();
      return "---";
    }
    await client.close();
    return (user.name)
  } finally {
    await client.close();
  }
}

async function checkValid(obj) {
  try {
    await client.connect();
    const database = client.db('sample_mflix');
    const users = database.collection('users');
    const event = obj.position;
    const id = obj.value;
    var user = null;
    if (event === "entry") {
      user = await users.findOne({ _id: id });
      if (user == null) {
        console.log("entry is null");
        await client.close();
        return false;
      }
      if (user.entry == true) {
        console.log("entry is true, returned false");
        await client.close();
        return false;
      }
      if (user.entry == false) {
        const updateDoc = {
          $set: {
            entry: true
          },
        };
        const filter = { _id: id }
        const result = await users.findOneAndUpdate(filter, updateDoc, { returnOriginal: false });
        console.log(result)
        await client.close();
        return true;
      }
    } else {
      const dateOnly = moment().format('DD');
      const finalEvent = event + dateOnly;
      user = await users.findOne({ _id: id });
      if (user == null) {
        console.log("entry is null");
        await client.close();
        return false;
      }
      console.log(user[finalEvent]);
      if (user[finalEvent] == true) {
        console.log("entry is true, returned false");
        await client.close();
        return false;
      }
      if (user[finalEvent] == false) {
        const updateDoc = {
          $set: {
            [finalEvent]: true
          },
        };
        const filter = { _id: id }
        const result = await users.findOneAndUpdate(filter, updateDoc, { returnOriginal: false });
        console.log(result)
        await client.close();
        return true;
      }

    }
  } finally {
    await client.close();
  }

}





async function createQR(data) {
  const qr = await qr.imageSync(data, { type: 'png' });
  fs.writeFileSync('qrcode.png', qr);
  console.log('QR code PNG generated!!');
}

app.use(cors());
app.use(bodyParser.json());

app.post('/send_mail', async (req, res) => {
  const receivedData = req.body;
  console.log("email data received : ", receivedData);
  const response = await sendMail(receivedData);
  res.send(response);
})

app.get('/scan', async (req, res) => {
  const scannedValue = req.query.value;
  const position = req.query.position;
  const nameGet = await getName(scannedValue);
  const responseData = {
    name: nameGet,
    scannedValue: scannedValue,
  };

  res.json(responseData);
});

app.post('/create_new_user', async (req, res) => {
  const receivedData = req.body;
  console.log("Data received : ", receivedData);
  const response = await createUser(receivedData);
  res.send(response);
})

app.post('/accept', async (req, res) => {
  console.log(req.body);
  const result = await checkValid(req.body);
  res.send(result);
});

app.post('/reject', (req, res) => {
  console.log('Rejected');
  res.send('Rejected');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
