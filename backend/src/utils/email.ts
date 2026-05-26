import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendOTP = async (email: string, otpCode: string) => {
  if (!resend || process.env.RESEND_API_KEY === 'YOUR_RESEND_API_KEY_HERE') {
    // If the API key is not configured, we just print the OTP to the console for local development.
    console.log(`\n======================================================`);
    console.log(`[MOCK EMAIL] To: ${email}`);
    console.log(`[MOCK EMAIL] Subject: Your College Discovery Login OTP`);
    console.log(`[MOCK EMAIL] Code: ${otpCode}`);
    console.log(`======================================================\n`);
    return true;
  }

  try {
    const response = await resend.emails.send({
      from: 'College Discovery <onboarding@resend.dev>', // resend.dev allows sending to verified emails only in testing
      to: email,
      subject: 'Your College Discovery Login OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0f172a; text-align: center;">College Discovery Login</h2>
          <p style="color: #334155; font-size: 16px;">Here is your one-time password to log in. This code is valid for 10 minutes.</p>
          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${otpCode}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });
    
    if (response.error) {
      console.error('Failed to send OTP via Resend (API Error):', response.error);
      return false;
    }
    
    return !!response.data?.id;
  } catch (error) {
    console.error('Failed to send OTP via Resend (Exception):', error);
    return false;
  }
};
