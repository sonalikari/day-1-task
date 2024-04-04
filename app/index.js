const md5 = require('md5');
const { client, connectToMongoDB } = require('./database');
const usersData = require('./sampleUsers');

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

connectToMongoDB().then(() => {
  insertUsersData().then(() => {
    client.close();
  });
});
