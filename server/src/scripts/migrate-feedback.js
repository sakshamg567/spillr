import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Feedback from '../models/Feedback.js';

const MONGO = process.env.MONGO_URI 
async function run() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to mongo for feedback migration');

  await Feedback.updateMany(
    { $or: [{ userId: { $exists: false } }, { ipAddress: { $exists: false } }] },
    { $set: { userId: null, ipAddress: null } }
  );

  await Feedback.collection.createIndex({ wallId: 1, isAnswered: 1, isArchived: 1 });
  await Feedback.collection.createIndex({ userId: 1, wallId: 1 });
  await Feedback.collection.createIndex({ ipAddress: 1, wallId: 1 });

  console.log('Migration complete');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
