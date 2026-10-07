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

  const htmlBody = `
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
  `;

  // ─────────────────────────────────────────────────────────────
  // 1. BREVO HTTPS REST API (Port 443 - Recommended for Render Free tier)
  // ─────────────────────────────────────────────────────────────
  const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
  if (brevoApiKey) {
    const senderEmail = (process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'wearstep99@gmail.com').trim();
    const senderName = process.env.EMAIL_FROM_NAME || 'WearStep Security';

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email, name }],
          subject: `${otp} is your WearStep verification code`,
          htmlContent: htmlBody,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        console.log(`[Email via Brevo HTTP] OTP sent to ${email} (MessageId: ${data.messageId})`);
        return { sent: true, provider: 'brevo', messageId: data.messageId };
      } else {
        console.error('[Brevo HTTP Error]', data);
        return { sent: false, provider: 'brevo', error: data.message || JSON.stringify(data) };
      }
    } catch (err) {
      console.error('[Brevo HTTP Network Error]', err.message);
      return { sent: false, provider: 'brevo', error: err.message };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. RESEND HTTPS REST API (Port 443 - Compatible with Render)
  // ─────────────────────────────────────────────────────────────
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendApiKey) {
    const sender = process.env.RESEND_FROM || 'WearStep Security <onboarding@resend.dev>';
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sender,
          to: [email],
          subject: `${otp} is your WearStep verification code`,
          html: htmlBody,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        console.log(`[Email via Resend HTTP] OTP sent to ${email} (Id: ${data.id})`);
        return { sent: true, provider: 'resend', messageId: data.id };
      } else {
        console.error('[Resend HTTP Error]', data);
        return { sent: false, provider: 'resend', error: data.message || JSON.stringify(data) };
      }
    } catch (err) {
      console.error('[Resend HTTP Network Error]', err.message);
      return { sent: false, provider: 'resend', error: err.message };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. NODEMAILER SMTP (Works on local dev & paid cloud tiers)
  // Note: Render Free tier blocks outbound ports 25, 465, and 587.
  // ─────────────────────────────────────────────────────────────
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (!user || !pass) {
    console.warn('[Email Warning] Neither BREVO_API_KEY, RESEND_API_KEY, nor EMAIL_USER/EMAIL_PASS are configured.');
    return {
      sent: false,
      error: 'Email service is not configured. Add BREVO_API_KEY or EMAIL_USER/EMAIL_PASS in Render Environment.',
    };
  }

  let transporter;
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000,
    });
  } else {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000,
    });
  }

  try {
    const info = await transporter.sendMail({
      from: `"WearStep Security" <${user}>`,
      to: email,
      subject: `${otp} is your WearStep verification code`,
      html: htmlBody,
    });
    console.log(`[Email via SMTP] OTP sent successfully to ${email} (MessageId: ${info.messageId})`);
    return { sent: true, provider: 'smtp', messageId: info.messageId };
  } catch (err) {
    console.error(`[Email SMTP Error] Failed to send email to ${email}:`, err.message);
    return {
      sent: false,
      provider: 'smtp',
      error: err.message,
      code: err.code,
      hint: err.code === 'ETIMEDOUT' ? 'Render Free Tier blocks outbound SMTP ports (25, 465, 587). Add BREVO_API_KEY to send via HTTPS Port 443.' : undefined,
    };
  }
};

module.exports = { sendOtpEmail };
