const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/socket');
const { startReminderService } = require('./utils/reminderService');

dotenv.config();
connectDB();
startReminderService();

const app = express();
const server = http.createServer(app);

// Init socket
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/medical-history', require('./routes/medicalHistoryRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));


app.get('/', (req, res) => res.send('Hospital API running ✅'));

server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});