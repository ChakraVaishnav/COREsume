import nodemailer from "nodemailer";

const createGmailTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 60000,     // 60 seconds
  });
};

// Fallback configuration for port 465 (SSL)
const createGmailSSLTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  });
};

// Try to create the best available transporter
let transporter = null;

try {
  // First try port 587 (recommended)
  transporter = createGmailTransporter();
} catch (error) {
  try {
    transporter = createGmailSSLTransporter();
  } catch (fallbackError) {
    throw fallbackError;
  }
}

export { transporter };

// Verify connection configuration
export const verifyConnection = async () => {
  try {
    if (!transporter) {
      return false;
    }
    
    await transporter.verify();
    return true;
  } catch (error) {
    
    // Try to recreate transporter with different configuration
    try {
      if (transporter.options.port === 587) {
        transporter = createGmailSSLTransporter();
      } else {
        transporter = createGmailTransporter();
      }
      
      await transporter.verify();
      return true;
    } catch (retryError) {
      return false;
    }
  }
};

export const sendOtpMail = async (to, otp, context = "signup") => {
  const subject = context === "forgot-password"
    ? "Reset Your Password - OTP"
    : "Verify Your Email - OTP";

  const title = context === "forgot-password"
    ? "Reset Your Password"
    : "Verify Your Email";

  const message = context === "forgot-password"
    ? "Use this OTP to reset your password. Do not share it with anyone."
    : "Use this OTP to verify your email during signup.";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">${title}</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h1 style="color: #facc15; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
      </div>
      <p style="color: #666; text-align: center; font-size: 14px;">
        ${message}<br />This code will expire in 10 minutes.
      </p>
    </div>
  `;

  const result = await transporter.sendMail({
    from: `"COREsume" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log("OTP Email sent:", result.messageId);
  return result;
};
