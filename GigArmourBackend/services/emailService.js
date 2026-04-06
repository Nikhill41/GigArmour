const { Resend } = require("resend");

const sendOtpEmail = async (recipientEmail, otpCode) => {
  try {
    console.log(`[Email Service] Attempting to send OTP to: ${recipientEmail}`);
    
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || "onboarding@resend.dev";

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured in environment variables");
    }

    const resend = new Resend(resendApiKey);

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; max-width: 500px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 24px;">GigArmour</h2>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="margin-top: 0; color: #666;">Hi there,</p>
          <p style="color: #666;">Your OTP for email verification is:</p>
          <div style="background: white; border: 2px solid #667eea; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="font-size: 32px; font-weight: 700; letter-spacing: 4px; margin: 0; color: #667eea;">${otpCode}</p>
          </div>
          <p style="color: #999; font-size: 13px; text-align: center;">This OTP expires in 10 minutes. Do not share this code with anyone.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 0;">© 2026 GigArmour. All rights reserved.</p>
        </div>
      </div>
    `;

    console.log(`[Email Service] Using Resend API to send email from: ${emailFrom}`);

    const result = await resend.emails.send({
      from: emailFrom,
      to: recipientEmail,
      subject: "Your GigArmour OTP",
      html
    });

    if (result.error) {
      console.error(`[Email Service] ❌ Resend API error:`, result.error);
      throw new Error(`Email service error: ${result.error.message}`);
    }
    
    console.log(`[Email Service] ✅ Email sent successfully:`, result.data.id);
    return result.data;
  } catch (error) {
    console.error(`[Email Service] ❌ Failed to send OTP:`, error.message);
    console.error(`[Email Service] Error stack:`, error);
    throw error;
  }
};

module.exports = {
  sendOtpEmail
};
