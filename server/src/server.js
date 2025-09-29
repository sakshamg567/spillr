import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


const envPaths = [
  path.resolve(__dirname, '.env'),           
  path.resolve(__dirname, '../.env'),       
  path.resolve(process.cwd(), '.env')        
];

let envLoaded = false;
for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('⚠ No .env file found in common locations');
  console.log('Tried paths:', envPaths);
}


const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(` Missing required environment variable: ${envVar}`);
    console.error(`\nPlease create a .env file with the following variables:`);
    console.error(requiredEnvVars.join('\n'));
    process.exit(1);
  }
}

console.log('✓ All required environment variables are set');

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Authentication: JWT-based (stateless)`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/auth/health`);
  });
}).catch(err => {
  console.error('Server failed:', err.message);
  process.exit(1);
});