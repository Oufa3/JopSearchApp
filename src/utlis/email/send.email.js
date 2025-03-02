import nodemailer from "nodemailer";

export const subjectTypes = {
    confirmEmail: "Confirm-Email",
    forgetPassword:"Forget-Password",
    resetPassword: "reset-password",
    updateEmail: "update-Email"
}

export const sendEmail = async ({
    to = [],
    cc = [],
    bcc = [],
    subject = "JobSearchApp",
    text = "",
    html = "",
    attachments = [],
} = {}) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // async..await is not allowed in global scope, must use a wrapper
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: `"Job-Search" <${process.env.EMAIL}>`, // sender address
        to,
        cc,
        bcc,
        subject,
        text,
        html,
        attachments
    });
    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}



