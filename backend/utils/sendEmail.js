const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const emailTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f7fb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0ea5e9, #0369a1); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p { color: #bae6fd; margin: 5px 0 0; font-size: 14px; }
    .body { padding: 30px; }
    .otp-box { background: #f0f9ff; border: 2px dashed #0ea5e9; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
    .otp-code { font-size: 36px; font-weight: bold; color: #0369a1; letter-spacing: 8px; }
    .booking-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .booking-number { font-size: 22px; font-weight: bold; color: #15803d; letter-spacing: 3px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .info-label { color: #64748b; }
    .info-value { color: #1e293b; font-weight: 500; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
    .btn { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px; }
    .warning { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px; font-size: 13px; color: #9a3412; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 MediCare Hospital</h1>
      <p>No. 45, Palaali Road, Jaffna, Sri Lanka | +94 11 234 5678</p>    </div>
    <div class="body">
      <h2 style="color:#1e293b">${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} MediCare Hospital (Pvt) Ltd. All rights reserved.</p>
      <p>Registered under the Ministry of Health, Sri Lanka | Reg No: MOH/2024/0123</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"MediCare Hospital" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error('Email error:', err.message);
    throw err;
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateBookingNumber = () => {
  const prefix = 'MC';
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${year}-${random}`;
};

const sendWelcomeEmail = async (to, name, role) => {
  const content = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>Welcome to <strong>MediCare Hospital</strong>! Your account has been successfully created.</p>
    <div class="info-row">
      <span class="info-label">Name</span>
      <span class="info-value">${name}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Email</span>
      <span class="info-value">${to}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Account Type</span>
      <span class="info-value" style="text-transform:capitalize">${role}</span>
    </div>
    <br/>
    ${role === 'doctor'
      ? '<p style="color:#0369a1">⏳ Your doctor profile is under review. Admin will approve it shortly.</p>'
      : '<p style="color:#15803d">✅ You can now browse doctors and book appointments.</p>'
    }
    <div class="warning">
      🔒 Keep your login credentials safe. MediCare staff will never ask for your password.
    </div>
  `;
  await sendEmail(
    to,
    '✅ Welcome to MediCare Hospital — Account Created',
    emailTemplate(`Welcome to MediCare, ${name}!`, content)
  );
};

const sendLoginEmail = async (to, name) => {
  const now = new Date();
  const content = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>A new login was detected on your MediCare account.</p>
    <div class="info-row">
      <span class="info-label">Date</span>
      <span class="info-value">${now.toLocaleDateString('en-LK')}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Time</span>
      <span class="info-value">${now.toLocaleTimeString('en-LK')}</span>
    </div>
    <div class="warning">
      ⚠️ If this was not you, please contact us immediately at +94 11 234 5678 or info@medicare.lk
    </div>
  `;
  await sendEmail(
    to,
    '🔐 New Login Detected — MediCare Hospital',
    emailTemplate('Login Notification', content)
  );
};

const sendAppointmentEmail = async (to, name, doctorName, date, time, problem) => {
  const otp = generateOTP();
  const bookingNumber = generateBookingNumber();

  const content = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>Your appointment has been successfully booked at MediCare Hospital.</p>

    <div class="booking-box">
      <p style="margin:0;color:#15803d;font-size:13px">Booking Reference Number</p>
      <div class="booking-number">${bookingNumber}</div>
      <p style="margin:5px 0 0;font-size:12px;color:#64748b">
        Present this number at the reception desk
      </p>
    </div>

    <div class="otp-box">
      <p style="margin:0;color:#0369a1;font-size:13px">Your Verification Code (OTP)</p>
      <div class="otp-code">${otp}</div>
      <p style="margin:5px 0 0;font-size:12px;color:#64748b">
        Show this code to your doctor to verify your appointment
      </p>
    </div>

    <h3 style="color:#1e293b;margin-top:20px">Appointment Details</h3>
    <div class="info-row">
      <span class="info-label">Doctor</span>
      <span class="info-value">Dr. ${doctorName}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Date</span>
      <span class="info-value">${date}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Time</span>
      <span class="info-value">${time}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Reason</span>
      <span class="info-value">${problem || 'General consultation'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Status</span>
      <span class="info-value" style="color:#d97706">⏳ Pending Confirmation</span>
    </div>
    <div class="info-row">
      <span class="info-label">Hospital</span>
      <span class="info-value">MediCare Hospital, Colombo 03</span>
    </div>

    <div class="warning">
      ⚠️ Please arrive 15 minutes before your appointment time. Bring this email and a valid ID.
    </div>
  `;

  await sendEmail(
    to,
    `📋 Appointment Booked — Ref: ${bookingNumber}`,
    emailTemplate('Appointment Confirmation', content)
  );

  return { otp, bookingNumber };
};

const sendAppointmentStatusEmail = async (to, name, status, doctorName, date, time, bookingNumber) => {
  const isConfirmed = status === 'confirmed';
  const content = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>Your appointment status has been updated.</p>

    <div class="booking-box" style="${isConfirmed ? '' : 'background:#fef2f2;border-color:#fca5a5'}">
      <p style="margin:0;font-size:13px;color:${isConfirmed ? '#15803d' : '#dc2626'}">
        ${isConfirmed ? '✅ Appointment Confirmed!' : '❌ Appointment Cancelled'}
      </p>
      ${bookingNumber
        ? `<div class="booking-number" style="font-size:18px;color:${isConfirmed ? '#15803d' : '#dc2626'}">${bookingNumber}</div>`
        : ''
      }
    </div>

    <div class="info-row">
      <span class="info-label">Doctor</span>
      <span class="info-value">Dr. ${doctorName}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Date</span>
      <span class="info-value">${date}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Time</span>
      <span class="info-value">${time}</span>
    </div>

    ${isConfirmed
      ? '<p style="color:#15803d;margin-top:15px">✅ Please arrive 15 minutes early with your booking reference and valid ID.</p>'
      : '<p style="color:#dc2626;margin-top:15px">We apologize for the inconvenience. Please book another appointment.</p>'
    }
  `;

  await sendEmail(
    to,
    `${isConfirmed ? '✅ Appointment Confirmed' : '❌ Appointment Cancelled'} — MediCare Hospital`,
    emailTemplate(
      `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      content
    )
  );
};

const sendDoctorApprovalEmail = async (to, name, status) => {
  const isApproved = status === 'approved';
  const content = `
    <p>Dear <strong>Dr. ${name}</strong>,</p>
    <p>Your MediCare Hospital doctor account has been
      <strong>${status}</strong> by the administrator.
    </p>
    ${isApproved
      ? `<p style="color:#15803d">✅ You can now log in and start receiving patient appointments.</p>
         <a href="http://localhost:5173/login" class="btn">Login to Dashboard</a>`
      : `<p style="color:#dc2626">❌ Unfortunately your application was not approved at this time.</p>
         <p>Please contact us at info@medicare.lk for more information.</p>`
    }
  `;
  await sendEmail(
    to,
    `${isApproved ? '✅ Doctor Account Approved' : '❌ Doctor Account Rejected'} — MediCare Hospital`,
    emailTemplate(
      `Account ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      content
    )
  );
};

module.exports = {
  sendEmail,
  emailTemplate,
  sendWelcomeEmail,
  sendLoginEmail,
  sendAppointmentEmail,
  sendAppointmentStatusEmail,
  sendDoctorApprovalEmail,
  generateOTP,
  generateBookingNumber
};