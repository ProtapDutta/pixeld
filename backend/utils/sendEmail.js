// backend/utils/sendEmail.js

import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // Configure based on environment variables
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465, // Use SSL if port is 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
        // Optional: for better deliverability
        tls: {
            rejectUnauthorized: false
        }
    });

    // Define the email options
    const mailOptions = {
        from: `Pixel Drive <${process.env.FROM_EMAIL}>`, 
        to: options.email,                             
        subject: options.subject,                      
        html: options.html,                            
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;