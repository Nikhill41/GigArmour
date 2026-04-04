const nodemailer = require("nodemailer");

const buildTransporter = () => {
  const user = process.env.EMAIL;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    throw new Error("Email credentials are missing");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass
    }
  });
};

const sendOtpEmail = async (recipientEmail, otpCode) => {
  const transporter = buildTransporter();
  const from = process.env.EMAIL;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>GigArmour email verification</h2>
      <p>Your OTP is:</p>
      <p style="font-size: 22px; font-weight: bold; letter-spacing: 2px;">${otpCode}</p>
      <p>This OTP expires in 10 minutes.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `GigArmour <${from}>`,
    to: recipientEmail,
    subject: "Your GigArmour OTP",
    html
  });
};

module.exports = {
  sendOtpEmail
};
