import { Resend } from "resend";
import { env } from "./env";

const resend = new Resend(env.RESEND_API_KEY);

/**
 * Sends a 6-digit verification code to the user's email.
 */
export async function sendVerificationEmail(email: string, otp: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "IPL Roast AI <onboarding@resend.dev>", // Replace with your domain once verified on Resend
      to: [email],
      subject: "Verify your email - IPL Roast AI",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Welcome to IPL Roast AI 🏏</h2>
          <p>You're one step away from joining the roasted fun! Use the 6-digit code below to verify your email address:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      // Fallback for development: Log the OTP to terminal so the user isn't blocked
      console.log("-----------------------------------------");
      console.log(`[DEV] Verification Code for ${email}: ${otp}`);
      console.log("-----------------------------------------");
      return { success: true, message: "Email failed to send, but OTP logged to terminal (Testing Mode)." };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Mail Error:", err);
    return {
      success: false,
      message: "An unexpected error occurred while sending email.",
    };
  }
}
