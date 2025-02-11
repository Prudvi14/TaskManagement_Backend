// we will be using nodemailer to send the email
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: process.env.SEND_MAIL_GMAIL_ACCOUNT,
        pass: process.env.SEND_MAIL_GMAIL_ACCOUNT_PASSWORD,
    },
});

// note that: from email is actually fixed,
// you can only try to send the name for your email account
const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"Task Management Tool" <cloudfile2024@gmail.com>',
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
// what does the asynchronous function return ?

const sendOtpEmail = async (email, otp) => {
    const isEmailSent = await sendEmail(
        email,
        "OTP verification from Task Management Tool",
        `<p>Your OTP is <span style="color:brown">${otp}</span></p>`
    );
    //TODO: you can retry to do something else : its upto you
    return isEmailSent;
};

module.exports = {
    sendOtpEmail,
};
