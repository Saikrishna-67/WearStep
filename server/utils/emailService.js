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

  // If SMTP is configured in environment
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"WearStep Security" <${process.env.SMTP_FROM || 'security@wearstep.com'}>`,
        to: email,
        subject: 'Your WearStep Password Reset Code',
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #E9E7E1; padding: 40px 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: #FBFAF7; border: 2px solid #191A18; padding: 32px; border-radius: 4px;">
              <h1 style="font-size: 24px; color: #191A18; margin-bottom: 8px;">WEAR<span style="color: #C1440E;">STEP</span></h1>
              <p style="color: #6E7370; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 24px;">Wear Your Style. Step Your Way.</p>
              
              <p style="color: #191A18; font-size: 15px;">Hello ${name},</p>
              <p style="color: #3d3e3b; font-size: 14px; line-height: 1.6;">You requested a password reset for your WearStep account. Use the verification code below:</p>
              
              <div style="background: #191A18; color: #F4CD6A; font-family: monospace; font-size: 32px; letter-spacing: 8px; text-align: center; padding: 18px; margin: 24px 0; border-radius: 2px; font-weight: bold;">
                ${otp}
              </div>
              
              <p style="color: #6E7370; font-size: 12px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
          </div>
        `,
      });
      console.log(`[Email] OTP email sent successfully to ${email}`);
    } catch (err) {
      console.error(`[Email Warning] Could not send via SMTP (${err.message}). OTP is logged to console above.`);
    }
  }

  return true;
};

module.exports = { sendOtpEmail };
