import nodemailer from "nodemailer";

// Primary Gmail configuration with port 587 (STARTTLS)
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
  console.log("Using Gmail SMTP with port 587 (STARTTLS)");
} catch (error) {
  console.log("Port 587 failed, trying port 465 (SSL)");
  try {
    transporter = createGmailSSLTransporter();
    console.log("Using Gmail SMTP with port 465 (SSL)");
  } catch (fallbackError) {
    console.error("Both SMTP configurations failed:", fallbackError);
    throw fallbackError;
  }
}

export { transporter };

// Verify connection configuration
export const verifyConnection = async () => {
  try {
    if (!transporter) {
      console.error("No transporter available");
      return false;
    }
    
    await transporter.verify();
    console.log("Email server connection verified successfully");
    return true;
  } catch (error) {
    console.error("Email server connection failed:", error);
    
    // Try to recreate transporter with different configuration
    try {
      if (transporter.options.port === 587) {
        console.log("Retrying with SSL configuration...");
        transporter = createGmailSSLTransporter();
      } else {
        console.log("Retrying with STARTTLS configuration...");
        transporter = createGmailTransporter();
      }
      
      await transporter.verify();
      console.log("Email server connection verified after retry");
      return true;
    } catch (retryError) {
      console.error("Email server connection failed after retry:", retryError);
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
