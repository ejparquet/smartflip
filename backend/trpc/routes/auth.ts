import { z } from "zod";
import { Resend } from "resend";
import { createTRPCRouter, publicProcedure } from "../create-context";

const verificationCodes = new Map<string, { code: string; expiresAt: number; userData: Record<string, unknown> }>();

const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const authRouter = createTRPCRouter({
  sendVerificationCode: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string(),
        role: z.enum(["homeowner", "professional"]),
        professionalType: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (!resendApiKey) {
        console.error("RESEND_API_KEY not configured");
        throw new Error("Email service not configured");
      }

      const resend = new Resend(resendApiKey);
      const code = generateCode();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      verificationCodes.set(input.email.toLowerCase(), {
        code,
        expiresAt,
        userData: {
          name: input.name,
          email: input.email,
          role: input.role,
          professionalType: input.professionalType,
        },
      });

      console.log(`Sending verification code ${code} to ${input.email}`);

      try {
        await resend.emails.send({
          from: "Smart Flip <onboarding@resend.dev>",
          to: input.email,
          subject: "Verify your Smart Flip account",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #1E3A5F; text-align: center;">Welcome to Smart Flip!</h1>
              <p style="font-size: 16px; color: #333;">Hi ${input.name},</p>
              <p style="font-size: 16px; color: #333;">Your verification code is:</p>
              <div style="background: #F5F7FA; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1E3A5F;">${code}</span>
              </div>
              <p style="font-size: 14px; color: #666;">This code expires in 10 minutes.</p>
              <p style="font-size: 14px; color: #666;">If you didn't request this code, please ignore this email.</p>
            </div>
          `,
        });

        return { success: true, message: "Verification code sent" };
      } catch (error) {
        console.error("Failed to send email:", error);
        throw new Error("Failed to send verification email");
      }
    }),

  verifyCode: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().length(6),
      })
    )
    .mutation(async ({ input }) => {
      const stored = verificationCodes.get(input.email.toLowerCase());

      if (!stored) {
        throw new Error("No verification code found. Please request a new one.");
      }

      if (Date.now() > stored.expiresAt) {
        verificationCodes.delete(input.email.toLowerCase());
        throw new Error("Verification code has expired. Please request a new one.");
      }

      if (stored.code !== input.code) {
        throw new Error("Invalid verification code. Please try again.");
      }

      verificationCodes.delete(input.email.toLowerCase());

      return {
        success: true,
        verified: true,
        userData: stored.userData,
      };
    }),

  resendCode: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const stored = verificationCodes.get(input.email.toLowerCase());

      if (!stored) {
        throw new Error("No pending verification found. Please sign up again.");
      }

      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (!resendApiKey) {
        throw new Error("Email service not configured");
      }

      const resend = new Resend(resendApiKey);
      const code = generateCode();
      const expiresAt = Date.now() + 10 * 60 * 1000;

      verificationCodes.set(input.email.toLowerCase(), {
        ...stored,
        code,
        expiresAt,
      });

      console.log(`Resending verification code ${code} to ${input.email}`);

      try {
        await resend.emails.send({
          from: "Smart Flip <onboarding@resend.dev>",
          to: input.email,
          subject: "Your new Smart Flip verification code",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #1E3A5F; text-align: center;">New Verification Code</h1>
              <p style="font-size: 16px; color: #333;">Here's your new verification code:</p>
              <div style="background: #F5F7FA; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1E3A5F;">${code}</span>
              </div>
              <p style="font-size: 14px; color: #666;">This code expires in 10 minutes.</p>
            </div>
          `,
        });

        return { success: true, message: "New verification code sent" };
      } catch (error) {
        console.error("Failed to resend email:", error);
        throw new Error("Failed to resend verification email");
      }
    }),
});
