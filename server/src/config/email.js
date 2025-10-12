import dotenv from "dotenv";
dotenv.config();
import nodemailer from 'nodemailer';

let transporter = null;

if (process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
   transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: process.env.EMAIL_PORT === "587",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

    console.log(`📧 Email transporter using ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);

    transporter.verify((error, success) => {
      if (error) {
        console.error(' Error verifying email transporter config:', error);
      } else {
        console.log(' Email transporter is ready');
      }
    });

} else {
    console.warn('  Email configuration incomplete. Email features will be disabled.');
}

export default transporter;