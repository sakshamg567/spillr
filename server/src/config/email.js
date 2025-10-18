import dotenv from "dotenv";
dotenv.config();
import nodemailer from 'nodemailer';

let transporter = null;

if (process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_PORT === "465", 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
   
    pool: true, 
    maxConnections: 5,
    maxMessages: 10,

    tls: {
      rejectUnauthorized: true, 
      minVersion: 'TLSv1.2'
    },
 
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
    socketTimeout: 30000, 
 
    logger: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production'
  });

 transporter.verify((error, success) => {
    if (error) {
      console.error(' Email transporter verification FAILED:');
      console.error('   Error:', error.message);
      console.error('   Code:', error.code);
      
      if (error.code === 'EAUTH') {
        console.error('    Fix: Check EMAIL_USER and EMAIL_PASS are correct');
        console.error('    Make sure you\'re using SMTP password (not account password)');
        console.error('    Get SMTP credentials from: https://app.brevo.com/settings/keys/smtp');
      } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        console.error('    Fix: Check EMAIL_HOST and EMAIL_PORT are correct');
        console.error('    Brevo SMTP: smtp-relay.brevo.com:587');
      } else if (error.code === 'ESOCKET') {
        console.error('    Fix: Network/firewall issue. Check if port 587 is accessible');
      }
      
      console.warn(' Email service will be disabled');
    } else {
      console.log('Email transporter is ready and verified');
      console.log('   You can send emails now!');
    }
  });

} else {
  console.warn(' Email configuration incomplete. Email features will be disabled.');
  console.warn('   Missing environment variables:');
  if (!process.env.EMAIL_HOST) console.warn('   - EMAIL_HOST');
  if (!process.env.EMAIL_PORT) console.warn('   - EMAIL_PORT');
  if (!process.env.EMAIL_USER) console.warn('   - EMAIL_USER');
  if (!process.env.EMAIL_PASS) console.warn('   - EMAIL_PASS');
  console.warn('');
  console.warn('   For Brevo (Sendinblue), set these in your .env:');
  console.warn('   EMAIL_HOST=smtp-relay.brevo.com');
  console.warn('   EMAIL_PORT=587');
  console.warn('   EMAIL_USER=your-brevo-email@example.com');
  console.warn('   EMAIL_PASS=your-smtp-password-from-brevo');
  console.warn('');
  console.warn('   Get your SMTP credentials from:');
  console.warn('   https://app.brevo.com/settings/keys/smtp');
}

export default transporter;