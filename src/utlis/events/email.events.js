import { nanoid, customAlphabet } from 'nanoid'
import { EventEmitter } from "node:events"
import { verficationEmailTemplate } from '../email/template/verfication.template.js'
import { generateHash } from '../security/hash.security.js'
import { otpTypes, userModel } from '../../DB/model/user.model.js'
import { sendEmail, subjectTypes } from '../email/send.email.js'
export const emailEvent = new EventEmitter();


emailEvent.on("sendConfirmEmail", async (data) => {
    const { email } = data;
    const otp = customAlphabet("0123456789", 4)();
    const hashedOTP = generateHash({ plainText: `${otp}` });
    const OTPData = {
        code: hashedOTP,
        type: otpTypes.confirmEmail,
        expiresIn: new Date(Date.now() + 10 * 60 * 1000)
    };
    const updatedUser = await userModel.updateOne(
        { email },
        { $push: { OTP: OTPData } },
    );
    const html = verficationEmailTemplate({ code: otp });
    await sendEmail({ to: email, subject: "Confirm-Email", html });
    console.log("✅ Email Sent Successfully");
})


emailEvent.on("forgetpassword", async (data) => {
    const { email } = data;

    const otp = customAlphabet("0123456789", 4)();
    const html = verficationEmailTemplate({ code: otp });

    const forgetpasswordOTP = generateHash({ plainText: `${otp}` });


    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await userModel.updateOne(
        { email },
        {
            forgetpasswordOTP,
            otpExpiresAt,
            attemptCount: 0,
        }
    );

    await sendEmail({ to: email, subject: "forgetpassword", html });

    console.log("Email sent successfully!");
});
emailEvent.on("jobAccepted", async (data) => {
    const { email, jobTitle } = data;

    const html = `
        <h1>🎉 Congratulations!</h1>
        <p>Dear Candidate,</p>
        <p>We are pleased to inform you that you have been <strong>accepted</strong> for the position of <strong>${jobTitle}</strong>.</p>
        <p>We will contact you soon with further details.</p>
        <p>Best regards,<br>HR Team</p>
    `;

    await sendEmail({ to: email, subject: "Job Application Accepted", html });

    console.log(`Job acceptance email sent successfully to ${email}`);
});
emailEvent.on("jobRejected", async (data) => {
    const { email, jobTitle } = data;

    const html = `
        <h1>😞 Job Application Update</h1>
        <p>Dear Candidate,</p>
        <p>We appreciate your interest in the <strong>${jobTitle}</strong> position. However, after careful consideration, we regret to inform you that your application has not been selected at this time.</p>
        <p>We encourage you to apply for other opportunities in the future.</p>
        <p>Best regards,<br>HR Team</p>
    `;

    await sendEmail({ to: email, subject: "Job Application Update", html });

    console.log(`Job rejection email sent successfully to ${email}`);
});
