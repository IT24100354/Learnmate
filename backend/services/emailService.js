const nodemailer = require('nodemailer');

const getTransport = () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
};

const sendPasswordResetOtp = async ({ to, name, otp }) => {
  const transport = getTransport();
  if (!transport) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Password reset OTP for ${to}: ${otp}`);
      return;
    }
    throw new Error('Email service is not configured.');
  }

  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: 'LearnMate password reset OTP',
    text: `Hello ${name || 'there'},\n\nYour LearnMate password reset OTP is ${otp}. It expires in 10 minutes.\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <p>Hello ${name || 'there'},</p>
      <p>Your LearnMate password reset OTP is <strong>${otp}</strong>.</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `
  });
};

module.exports = { sendPasswordResetOtp };
