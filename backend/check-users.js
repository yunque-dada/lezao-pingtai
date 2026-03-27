const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lezao');
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      role: String,
    }));

    const users = await User.find({}, 'username role _id');
    console.log('\nAll users:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.role}): ${user._id}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
