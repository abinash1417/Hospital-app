const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const { sendEmail, emailTemplate } = require('./sendEmail');

const startReminderService = () => {
  cron.schedule('*/30 * * * *', async () => {
    console.log('⏰ Checking appointment reminders...');
    try {
      const now = new Date();

      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      const twoHoursLater = new Date(now.getTime() + 90 * 60 * 1000);

      const todayDate = oneHourLater.toISOString().split('T')[0];

      const appointments = await Appointment.find({
        status: 'confirmed',
        date: todayDate,
        reminderSent: { $ne: true }
      })
        .populate('patientId', 'name email')
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name' }
        });

      for (const apt of appointments) {
        const [hours, minutes] = apt.time.split(':').map(Number);
        const aptDateTime = new Date(apt.date);
        aptDateTime.setHours(hours, minutes, 0, 0);

        if (aptDateTime >= oneHourLater && aptDateTime <= twoHoursLater) {
          const content = `
            <p>Dear <strong>${apt.patientId?.name}</strong>,</p>
            <p>This is a reminder that you have an upcoming appointment at MediCare Hospital.</p>

            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px;margin:20px 0">
              <p style="margin:0;color:#15803d;font-size:13px;font-weight:bold">
                APPOINTMENT IN 1 HOUR
              </p>
            </div>

            <div style="margin:15px 0">
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px">
                <span style="color:#64748b">Doctor</span>
                <span style="color:#1e293b;font-weight:500">
                  Dr. ${apt.doctorId?.userId?.name}
                </span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px">
                <span style="color:#64748b">Date</span>
                <span style="color:#1e293b;font-weight:500">${apt.date}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px">
                <span style="color:#64748b">Time</span>
                <span style="color:#1e293b;font-weight:500">${apt.time}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px">
                <span style="color:#64748b">Booking Ref</span>
                <span style="color:#15803d;font-weight:bold">${apt.bookingNumber}</span>
              </div>
            </div>

            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px;font-size:13px;color:#9a3412;margin-top:15px">
              ⚠️ Please arrive 15 minutes early. Bring this email and a valid ID.
              Hospital Address: No. 45, Palaali Road, Jaffna, Sri Lanka            </div>
          `;

          try {
            await sendEmail(
              apt.patientId?.email,
              'Appointment Reminder — 1 Hour Left | MediCare Hospital',
              emailTemplate('Appointment Reminder', content)
            );

            await Appointment.findByIdAndUpdate(apt._id, {
              reminderSent: true
            });

            console.log(`📧 Reminder sent to ${apt.patientId?.email}`);
          } catch (emailErr) {
            console.log('Reminder email error:', emailErr.message);
          }
        }
      }
    } catch (err) {
      console.log('Reminder service error:', err.message);
    }
  });

  console.log('⏰ Appointment reminder service started');
};

module.exports = { startReminderService };