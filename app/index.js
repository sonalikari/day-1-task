const express = require('express');
const md5 = require('md5');
const { client, connectToMongoDB } = require('./database');
const usersData = require('./sampleUsers');
const { getAverageAge } = require('./averageAge');
const { deleteUsersAbove25 } = require('./deleteUsers');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

async function insertUsersData() {
  try {
    const db = client.db('data');
    const usersCollection = db.collection('Users');

    for (const userData of usersData) {
      userData.password = md5(userData.password);

      const result = await usersCollection.insertOne(userData);
      console.log('User inserted:', result.insertedId);

      const userId = result.insertedId;

      const userProfileData = {
        user_id: userId,
        dob: userData.dob,
        mobile_no: userData.mobileNo
      };

      await db.collection('UsersProfile').insertOne(userProfileData);
      console.log('UserProfile inserted for user:', userId);
    }
  } catch (err) {
    console.error('Error inserting users data:', err);
  }
}

app.get('/average-age', async (req, res) => {
  try {
    await connectToMongoDB();
    await getAverageAge(req, res);
  } catch (err) {
    console.error('Error handling average age request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/delete-users-above-25', async (req, res) => {
  try {
    await connectToMongoDB();
    await deleteUsersAbove25(req, res);
  } catch (err) {
    console.error('Error handling delete users request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function startServer() {
  try {
    await connectToMongoDB();
    await insertUsersData();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('An error occurred while starting the server:', error);
  }
}

startServer();
