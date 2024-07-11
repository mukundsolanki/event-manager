const { MongoClient } = require("mongodb");
const axios = require('axios');
require('dotenv').config();

// Replace the uri string with your connection string.
const uri = process.env.URI;

const client = new MongoClient(uri);

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
// run();


////


async function sendData(name, slot, address, email, phone) {
    const data = { name: name, slot: slot, address: address, email: email, phone: phone };

    try {
        const response = await axios.post('http://localhost:5000/create_new_user', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response from server:', response.data);
    } catch (error) {
        console.error('Error sending data:', error);
    }
}

async function sendMail(email, name, slot) {
    const data = { email: email, name: name, slot: slot };

    try {
        const response = await axios.post('http://localhost:5000/send_mail', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response from server:', response.data);
    } catch (error) {
        console.error('Error sending data:', error);
    }
}

sendData("New Test", 2, "Dewas", "dakshkitukale03@gmail.com", "9669384428");