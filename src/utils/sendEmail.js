const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendEmail = async (emailOption) => {
  const { to, subject, type, name, code } = emailOption;

  if (!to || !subject || !type || !name || (type !== "sign up" && !code)) {
    throw new Error("Invalid email options");
  }

  const content = `
             ${
               type === "sign up"
                 ? `<p>Hello ${name},</p>
                    `
                 : `
             <p>Hello ${name},</p>
             <p>Copy this ${code} to be used to reset your password. It will expire in 2 hours.</p>
             `
             }
  `;
  const html = `
    <html>
    <head>
      <style>
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 10px;
          text-align: center;
        }
        .content {
          margin: 20px;
          font-family: Arial, sans-serif;
          color: #333;
        }
        
        a.button {
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          margin-top: 20px;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Welcome</h1>
      </div>
      <div class="content">
        ${content}
      </div>
    </body>
  </html>    
    `;
  const mailOptions = {
    from: `Transcript Summarizer <${process.env.EMAIL}>`,
    to: to,
    subject: subject,
    html: html,
  };

  try {
    // Use async/await with transporter.sendMail to handle errors
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

module.exports = { sendEmail };
