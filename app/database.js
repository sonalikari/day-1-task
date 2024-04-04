require('dotenv').config(); 
const { MongoClient } = require('mongodb');

const uri = process.env.DB_URI;

const client = new MongoClient(uri);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err; 
  }
}

module.exports = { client, connectToMongoDB };
