import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpMail = async (to, otp) => {
  await transporter.sendMail({
    from: `"Resumint OTP" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Resumint OTP Code",
    html: `<h2>Your OTP is: <span style="color:#facc15;">${otp}</span></h2>`,
  });
};
