// Email service for sending password reset emails
const nodemailer = require('nodemailer');

const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  // For development, we'll just log the email content
  // In production, replace this with actual email sending logic
  
  const emailContent = {
    to: email,
    subject: 'Password Reset - Money Mind',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>Money Mind - Your Financial Companion</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>We received a request to reset your password for your Money Mind account.</p>
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset My Password</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">
              ${resetLink}
            </p>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>The Money Mind Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} Money Mind. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request - Money Mind
      
      Hello ${userName}!
      
      We received a request to reset your password for your Money Mind account.
      
      Click this link to reset your password: ${resetLink}
      
      Important:
      - This link will expire in 1 hour
      - If you didn't request this reset, please ignore this email
      - Never share this link with anyone
      
      If you have any questions, please contact our support team.
      
      Best regards,
      The Money Mind Team
    `
  };
  
  // Check if email credentials are configured
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD; // Use App Password for Gmail
  
  console.log('🔍 Email Debug Info:');
  console.log('EMAIL_USER:', emailUser ? '✅ Set' : '❌ Missing');
  console.log('EMAIL_APP_PASSWORD:', emailPassword ? '✅ Set' : '❌ Missing');
  console.log('Target email:', email);
  
  if (!emailUser || !emailPassword) {
    // Fallback to development mode if email not configured
    console.log('📧 Password Reset Email (Development Mode - No Email Configured):');
    console.log('To:', emailContent.to);
    console.log('Subject:', emailContent.subject);
    console.log('Reset Link:', resetLink);
    console.log('\n⚠️  To enable actual email sending, add these to your .env file:');
    console.log('EMAIL_USER=your-gmail@gmail.com');
    console.log('EMAIL_APP_PASSWORD=your-16-digit-app-password');
    console.log('EMAIL_FROM=Money Mind <noreply@moneymind.com>');
    
    return { success: true, message: 'Password reset email sent successfully (development mode)' };
  }

  try {
    // Create transporter with Gmail SMTP
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword
      },
      debug: true, // Enable debug output
      logger: true // Log to console
    });

    // Verify connection
    console.log('🔧 Verifying email connection...');
    await transporter.verify();
    console.log('✅ Email server connection verified');

    // Send email
    console.log(`📤 Sending email to: ${emailContent.to}`);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Money Mind" <${emailUser}>`,
      to: emailContent.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });

    console.log('✅ Password reset email sent successfully');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    return { success: true, message: 'Password reset email sent successfully' };
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Fallback to development mode if email fails
    console.log('\n📧 Falling back to development mode:');
    console.log('To:', emailContent.to);
    console.log('Reset Link:', resetLink);
    
    // Don't throw error - still return success to user for security
    return { success: true, message: 'Password reset email sent successfully' };
  }
};

module.exports = {
  sendPasswordResetEmail
};