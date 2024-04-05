const { client } = require('./database');

async function getAverageAge(req, res) {
  try {
    const db = client.db('data');
    const usersCollection = db.collection('Users');

    const result = await usersCollection.aggregate([
      {
        $addFields: {
          dob: { $toDate: '$dob' }, 
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), { $toDate: '$dob' }] },
                1000 * 60 * 60 * 24 * 365 
              ]
            }
          }
        }
      }
    ]).toArray();

    let totalAge = 0;
    result.forEach(user => {
      totalAge += user.age;
    });
    const averageAge = result.length > 0 ? totalAge / result.length : 0;

    res.json({ averageAge });
  } catch (err) {
    console.error('Error getting average age:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getAverageAge };
