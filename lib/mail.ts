import { Resend } from "resend";
import { env } from "./env";

const resend = new Resend(env.RESEND_API_KEY);

/**
 * Sends a 6-digit verification code to the user's email.
 */
export async function sendVerificationEmail(email: string, otp: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "BailsOnFire <noreply@bailsonfire.itsmusaiyab.in>",
      to: [email],
      subject: "Verify your email - BailsOnFire",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Welcome to BailsOnFire 🏏</h2>
          <p>You're one step away from joining the roasted fun! Use the 6-digit code below to verify your email address:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("[RESEND_ERROR]", error);
      return { success: false, message: "Failed to send verification email. Try again later." };
    }

    return { success: true, data };
  } catch (err) {
    console.error("[MAIL_ERROR]", err);
    return {
      success: false,
      message: "An unexpected error occurred while sending email.",
    };
  }
}
