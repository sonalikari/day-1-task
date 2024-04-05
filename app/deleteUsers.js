const { client } = require('./database');

async function deleteUsersAbove25(req, res) {
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
      },
      {
        $match: { age: { $gt: 25 } }
      }
    ]).toArray();

    console.log('Deleted Count:', result.length);

    const deleteResult = await usersCollection.deleteMany({ _id: { $in: result.map(user => user._id) } });
    console.log('Deleted Count:', deleteResult.deletedCount);

    res.json({ deletedCount: deleteResult.deletedCount });
  } catch (err) {
    console.error('Error deleting users above 25:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { deleteUsersAbove25 };
