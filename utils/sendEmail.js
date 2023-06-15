const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodemailerConfig');
const sgMail = require('@sendgrid/mail');

const sendEmail = async ({ to, subject, html }) => {
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport(nodemailerConfig);

  return transporter.sendMail({
    from: '"CirroCloud HelpDesk" <info@CirroCloudug.com>', // sender address
    to,
    subject,
    html,
  });
};

const sendEmailSendGrid = async ({ to, subject, html }) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to,
    from: 'info@CirroCloudug.com',
    subject,
    text: 'and easy to do anywhere, even with Node.js',
    html,
  };
  const info = await sgMail.send(msg);
  console.log(info);
  return info;
};

module.exports = sendEmail;
