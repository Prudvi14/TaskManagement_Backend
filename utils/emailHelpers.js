const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: process.env.SEND_MAIL_GMAIL_ACCOUNT,
        pass: process.env.SEND_MAIL_GMAIL_ACCOUNT_PASSWORD,
    },
});

const sendEmail = async (to, subject, html) => {
    // console.log(process.env.SEND_MAIL_GMAIL_ACCOUNT);
    // console.log(process.env.SEND_MAIL_GMAIL_ACCOUNT_PASSWORD);
    try {
        const info = await transporter.sendMail({
            from: '"Task Management Tool" <prudhvigadeshulantr@gmail.com>',
            to,
            subject,
            html,
        });
        console.log(info.messageId);
        return true;
    } catch (err) {
        console.log("Error occurred in sendEmail");
        console.log(err.message);
        return false;
    }
};

const sendOtpEmail = async (email, otp) => {
    const isEmailSent = await sendEmail(
        email,
        "OTP verification",
        `<p>Your OTP is <span style="color:green">${otp}</span></p>`
    );
    return isEmailSent;
};

// const sendReminderMail = async (email, task) => {
//     const isEmailSent = await sendEmail(email, "Task Reminder", `<p>Your task is pending ${task}</p>`);
//     //TODO: you can retry to do something else : its upto you
//     return isEmailSent;
// };

module.exports = {
    sendOtpEmail,
    // sendReminderMail,
};
