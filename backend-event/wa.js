const axios = require('axios');

const url = 'https://graph.facebook.com/v20.0/340743242463466/messages';
const accessToken = 'EAAbL6WZAiKS4BOZBTsI1tLAoL5pSqc04mZAYakZCCE9m0WiwyPA2g0z265brgmgcPjZB7rblsra35xUzSvsD8fNmfnzEuygGAlnFbJ3ZCZC5drW151yc8raAyZCYjR8v5UJZCdDitTqOpTdNA1kLKqUqilNZCOavUz3ChxZAApQht7LHCkulXbyv5nQprwEY9q5EZAZCjXxlyRODouTaInZAFKBfAZD';

const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
};

const data = {
    messaging_product: 'whatsapp',
    to: '919669384428',  // Replace with the recipient's WhatsApp number
    type: 'template',
    template: {
        name: 'hello_world',
        language: {
            code: 'en_US'
        }
    }
};

axios.post(url, data, { headers })
    .then(response => {
        console.log('Response:', response.data);
    })
    .catch(error => {
        console.error('Error:', error);
    });