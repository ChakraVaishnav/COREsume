import { Resend } from "resend";

const FROM_EMAIL = "noreply@coresume.in";
const FROM_NAME = "COREsume";
const resend = new Resend(process.env.RESEND_API_KEY || "");

export const verifyConnection = async () => Boolean(process.env.RESEND_API_KEY);

export const sendOtpMail = async (to, otp, context = "signup") => {
  const isForgotPassword = context === "forgot-password";
  const subject = isForgotPassword
    ? "Reset your COREsume password"
    : "Verify your COREsume account";

  const title = isForgotPassword ? "Reset your password" : "Verify your email";
  const message = isForgotPassword
    ? "Use this OTP to reset your password. Do not share it with anyone."
    : "Use this OTP to verify your COREsume account.";

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

  const result = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject,
    html,
  });

  return result;
};
