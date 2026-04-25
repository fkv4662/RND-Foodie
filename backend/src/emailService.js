const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

const sendTemperatureAlert = async (foodItem, temperature) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.SUPERVISOR_EMAIL,
    subject: '🚨 Temperature Alert - Foodie Control Plan',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: red;">⚠️ Temperature Alert!</h2>
        <p>A critical temperature issue has been detected:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Food Item</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${foodItem}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Temperature Recorded</td>
            <td style="padding: 8px; border: 1px solid #ddd; color: red;">${temperature}°C</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Safe Limit</td>
            <td style="padding: 8px; border: 1px solid #ddd;">75°C minimum</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Time</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
          </tr>
        </table>
        <p style="color: red; font-weight: bold;">Immediate action required!</p>
        <p>Please check the Foodie Control Plan system for more details.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendTaskReminderEmail = async (incompleteTasks) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.SUPERVISOR_EMAIL,
    subject: '⚠️ Incomplete CCP Tasks Reminder - Foodie Control Plan',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: orange;">⚠️ CCP Task Reminder!</h2>
        <p>The following CCP tasks are incomplete:</p>
        <ul>
          ${incompleteTasks.map(task => `<li style="color: red;">${task}</li>`).join('')}
        </ul>
        <p>Please complete these tasks as soon as possible to maintain food safety compliance.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendCompletionEmail = async () => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.SUPERVISOR_EMAIL,
    subject: '✅ CCP Checks Completed - Foodie Control Plan',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: green;">✅ All CCP Checks Completed!</h2>
        <p>All daily CCP checks have been completed successfully.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
        <p>Great work keeping our food safety standards high!</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendTemperatureAlert, sendTaskReminderEmail, sendCompletionEmail };