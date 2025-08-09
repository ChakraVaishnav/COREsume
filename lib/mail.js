export const sendOtpMail = async (toEmail, otp, context = "signup") => {
  const subject = context === "forgot-password" ? "Reset Your Password - OTP" : "Verify Your Email - OTP";
  const message = context === "forgot-password"
    ? "Use this OTP to reset your password. Do not share it with anyone."
    : "Use this OTP to verify your email during signup.";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">${subject}</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h1 style="color: #facc15; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
      </div>
      <p style="color: #666; text-align: center; font-size: 14px;">
        ${message}<br />This code will expire in 10 minutes.
      </p>
    </div>
  `;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: "COREsume",
        email: "coresumeteam@gmail.com", // Verified sender in Brevo
      },
      to: [{ email: toEmail }],
      subject,
      htmlContent,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to send email");
  }

  return data;
};
