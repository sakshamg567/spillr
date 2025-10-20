import axios from 'axios';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error('BREVO_API_KEY not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const payload = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'Spillr',
        email: process.env.BREVO_SENDER_EMAIL
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
      textContent: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text
    };

    console.log('Sending email via Brevo API to:', to);

    const response = await axios.post(BREVO_API_URL, payload, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('Email sent successfully. Message ID:', response.data.messageId);
    return { success: true, messageId: response.data.messageId };

  } catch (error) {
    console.error('Failed to send email via Brevo:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data?.message || error.message);
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};

export default sendEmail;