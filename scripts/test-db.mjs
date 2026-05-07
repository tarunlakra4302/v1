import 'dotenv/config';
import mongoose from 'mongoose';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI must be set in .env');
    process.exit(1);
  }

  try {
    const startedAt = Date.now();
    await mongoose.connect(uri, { 
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000 
    });
    const elapsed = Date.now() - startedAt;

    console.log(`Connected to database in ${elapsed}ms`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('ERROR: Database connection failed');
    // Sanitize error to prevent URI leak
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(errorMessage.replace(uri, '***MONGODB_URI***'));
    
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}

main();
