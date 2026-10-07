const nodemailer = require('nodemailer');

const sendOtpEmail = async (email, otp, name = 'Valued Customer') => {
  console.log(`
┌────────────────────────────────────────────────────────┐
│  WEARSTEP PASSWORD RESET OTP                           │
│  To: ${email.padEnd(46)} │
│  OTP: ${otp.padEnd(45)} │
│  Valid for: 10 minutes                                 │
└────────────────────────────────────────────────────────┘
`);

  let transporter = null;
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (process.env.SMTP_HOST && user && pass) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });
  } else if (user && pass) {
    // Default to Gmail if EMAIL_USER and EMAIL_PASS are set
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"WearStep" <${process.env.SMTP_FROM || user}>`,
        to: email,
        subject: `${otp} is your WearStep verification code`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #F4F2EC; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid #e0ded9; padding: 32px; border-radius: 8px;">
              <h1 style="font-size: 24px; color: #191A18; margin: 0 0 8px;">WEAR<span style="color: #C1440E;">STEP</span></h1>
              <p style="color: #6E7370; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px;">Wear Your Style. Step Your Way.</p>
              
              <p style="color: #191A18; font-size: 15px;">Hello ${name},</p>
              <p style="color: #4a4b48; font-size: 14px; line-height: 1.6;">You requested a password reset. Use the 6-digit verification code below to set a new password:</p>
              
              <div style="background: #191A18; color: #F4CD6A; font-family: monospace; font-size: 32px; letter-spacing: 8px; text-align: center; padding: 18px; margin: 24px 0; border-radius: 6px; font-weight: bold;">
                ${otp}
              </div>
              
              <p style="color: #6E7370; font-size: 12px; margin-top: 24px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
          </div>
        `,
      });
      console.log(`[Email] OTP sent successfully to ${email}`);
      return { sent: true };
    } catch (err) {
      console.error(`[Email Error] Failed to send email: ${err.message}`);
      return { sent: false, error: err.message };
    }
  }

  return { sent: false, error: 'No email service configured' };
};

module.exports = { sendOtpEmail };
