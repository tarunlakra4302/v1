import 'dotenv/config';
import mongoose from 'mongoose';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI must be set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    if (!db) throw new Error('DB connection failed');

    const users = await db.collection('user').find({}).toArray();
    console.log('--- USERS IN DATABASE ---');
    users.forEach(u => {
      console.log(`- Name: ${u.name}, Email: ${u.email}, ID: ${u.id || u._id}`);
    });
    console.log('-------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
