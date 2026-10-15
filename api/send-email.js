const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { fullName, phone, bankName, message } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone number are required.' });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Mishra Legal Website" <${process.env.SMTP_USER}>`,
    to: process.env.TO_EMAIL,
    subject: `New Legal Consultation Request from ${fullName}`,
    text: `
      You have received a new consultation request:
      
      Full Name: ${fullName}
      Phone Number: ${phone}
      Bank Name & Freeze Type: ${bankName || 'Not provided'}
      Message/Details: ${message || 'Not provided'}
    `,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
        <h2 style="color: #111111; border-bottom: 2px solid #e6b452; padding-bottom: 10px;">New Consultation Request</h2>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Phone Number:</strong> ${phone}</p>
        <p><strong>Bank Name & Freeze Type:</strong> ${bankName || 'Not provided'}</p>
        <p><strong>Details / Incident Description:</strong></p>
        <p style="background: #fff; padding: 15px; border-left: 4px solid #e6b452; border-radius: 4px;">${message || 'Not provided'}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('SMTP Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to send email. Please try again later.' });
  }
}