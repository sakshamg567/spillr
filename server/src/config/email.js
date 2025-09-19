import nodemailer from 'nodemailer';

if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Warning: Email configuration (.env variables EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS) is incomplete. Email features (like account deletion confirmation) will be disabled.');
}

let transporter = null;


if (process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: false, 
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, 
        },
    });

  
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ Error verifying email transporter config:', error);
        } else {
            console.log('✅ Email transporter is ready');
        }
    });
}

export default transporter;