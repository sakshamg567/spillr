import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});


if (process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET) {
  console.log('Cloudinary configured successfully');
  console.log(`   Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  
  cloudinary.api.ping()
    .then(() => console.log('Cloudinary connection verified'))
    .catch(err => console.error('Cloudinary connection failed:', err.message));
} else {
  console.warn('Cloudinary not configured. Profile pictures will use local storage.');
  console.warn('This will cause images to disappear on Render/Railway!');
}

export default cloudinary;