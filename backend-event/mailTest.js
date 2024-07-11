const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "tempmail54321003@gmail.com",
        pass: "wfzfebnminuezahy",
    },
});


function sendMail(email) {
    transporter.sendMail({
        from: "tempmail54321003@gmail.com",
        to: email,
        subject: "Hello from Nodemailer 2",
        text: "This is a test email sent using Nodemailer.",
    }, (error, info) => {
        if (error) {
            console.error("Error sending email: ", error);
            return false;
        } else {
            console.log("Email sent: ", info.response);
            return true;
        }
    });
}

sendMail("dakshkitukale03@gmail.com");