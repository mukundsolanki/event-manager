
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
const { MongoClient } = require("mongodb");
const moment = require('moment');
var ObjectId = require('mongodb').ObjectId;
const eventDates = [10, 11, 12];
require('dotenv').config();

//This is MongoDB URI
const uri = process.env.URI;

const client = new MongoClient(String(uri));

async function run() {
  try {
    await client.connect();

    const database = client.db('sample_mflix');
    const movies = database.collection('movies');

    // Query for a movie that has the title 'Back to the Future'
    const query = { title: 'The Blue Bird' };
    const movie = await movies.findOne(query);

    console.log(movie);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function createUser(receivedData) {
  try {
    await client.connect();
    const database = client.db('sample_mflix');
    const users = database.collection('users');
    const userName = receivedData.name;
    const formatedDate = moment().format('DD-MM-YYYY')
    const formatedTime = moment().format('HH:mm:ss')
    const slot = receivedData.slot;
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


    const result = await users.insertOne(checks);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } finally {
    await client.close();
  }
}

async function getName(id_val) {
  try {
    await client.connect();
    const database = client.db('sample_mflix');
    const users = database.collection('users');
    const id = new ObjectId(String(id_val));
    user = await users.findOne({ _id: id });
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
    const id = new ObjectId(obj.value);
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

app.use(cors());
app.use(bodyParser.json());

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

app.post('/create_new_user', (req, res) => {
  const receivedData = req.body;
  console.log("Data received : ", receivedData);
  createUser(receivedData);
  res.send('Data received');
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
