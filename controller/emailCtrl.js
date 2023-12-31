const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = asyncHandler(async (data, req, res) => {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Wyldestang Gadgets" <gopuprakash@gmail.com>', // sender address
    to: data.to, // list of receivers
    subject: data.subject, // Subject line
    text: data.text, // plain text body
    html: data.htm, // html body
  });

  console.log("Message sent: %s", info.messageId);
});

module.exports = sendEmail;
