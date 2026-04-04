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
  try {
    console.log(`[Email Service] Attempting to send OTP to: ${recipientEmail}`);
    
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

    const mailOptions = {
      from: `GigArmour <${from}>`,
      to: recipientEmail,
      subject: "Your GigArmour OTP",
      html
    };

    console.log(`[Email Service] Mail options:`, { from: mailOptions.from, to: mailOptions.to });

    const result = await transporter.sendMail(mailOptions);
    
    console.log(`[Email Service] ✅ Email sent successfully:`, result.messageId);
    return result;
  } catch (error) {
    console.error(`[Email Service] ❌ Failed to send email:`, error.message);
    console.error(`[Email Service] Error details:`, error);
    throw error;
  }
};

module.exports = {
  sendOtpEmail
};
