import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import http from 'http';
import { Server } from 'socket.io';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tms';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'student'], default: 'student' },
  department: { type: String, default: 'Computer Science' },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  phone: { type: String, default: '' },
  status: { type: String, default: 'Active' },
  avatar: { type: String, default: '' }
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Subject Assignment' },
  priority: { type: String, default: 'Medium' },
  deadline: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedToName: { type: String, default: '' },
  assignedToRole: { type: String, default: 'student' },
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, default: 'Task Assigned' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);
const Notification = mongoose.model('Notification', notificationSchema);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: process.env.EMAIL_USER && process.env.EMAIL_PASS ? {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  } : undefined
});

const createToken = (user) => jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

const normalizeUser = (user) => {
  const source = typeof user?.toObject === 'function' ? user.toObject() : user;
  return {
    ...source,
    id: source._id?.toString(),
    _id: source._id?.toString(),
    supervisor_id: source.supervisorId ? source.supervisorId.toString() : null,
    joinedDate: source.createdAt ? source.createdAt.toISOString().split('T')[0] : ''
  };
};

const normalizeTask = (task) => {
  const source = typeof task?.toObject === 'function' ? task.toObject() : task;
  return {
    ...source,
    id: source._id?.toString(),
    _id: source._id?.toString(),
    created_by: source.createdBy ? source.createdBy.toString() : '',
    assigned_to: source.assignedTo ? source.assignedTo.toString() : '',
    assigned_to_name: source.assignedToName || '',
    assigned_to_role: source.assignedToRole || 'student',
    createdAt: source.createdAt ? source.createdAt.toISOString().split('T')[0] : ''
  };
};

const normalizeNotification = (notification) => {
  const source = typeof notification?.toObject === 'function' ? notification.toObject() : notification;
  return {
    ...source,
    id: source._id?.toString(),
    _id: source._id?.toString(),
    user_id: source.userId ? source.userId.toString() : '',
    sent_at: source.createdAt ? source.createdAt.toISOString().replace('T', ' ').substring(0, 16) : '',
    read_status: source.read,
    read: source.read
  };
};

const sendNotification = async ({ userId, type, title, message }) => {
  const notification = await Notification.create({ userId, type, title, message });
  const payload = normalizeNotification(notification);
  io.to(`user:${userId.toString()}`).emit('new-notification', payload);
  return payload;
};

const sendPendingTaskEmail = async (task) => {
  if (task.reminderSent) return;

  const assignee = await User.findById(task.assignedTo);
  const supervisor = assignee?.supervisorId ? await User.findById(assignee.supervisorId) : null;
  const recipients = [assignee?.email, supervisor?.email].filter(Boolean);

  if (!recipients.length) return;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'task-management-system@example.com',
    to: recipients,
    subject: `Pending Task Reminder: ${task.title}`,
    html: `<p>Hello,</p><p>The task <strong>${task.title}</strong> is still pending and needs attention.</p><p><strong>Deadline:</strong> ${task.deadline}</p><p>Please review and update the task status.</p>`
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('Email transport not configured. Pending task reminder logged for:', recipients);
    }
    await Task.findByIdAndUpdate(task._id, { reminderSent: true });
  } catch (error) {
    console.error('Failed to send reminder email:', error.message);
  }
};

const seedUsers = async () => {
  // Demo seeding disabled. The application now relies on Google-authenticated users.
  return;
};

io.on('connection', (socket) => {
  socket.on('authenticate', async (token) => {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(payload.id).select('-password');
      if (!user) return;
      socket.join(`user:${user._id.toString()}`);
      socket.emit('authenticated', { user });
    } catch (error) {
      socket.emit('auth-error', { message: 'Invalid token' });
    }
  });
});

app.get('/api/health', (_req, res) => res.json({ ok: true, message: 'Task management API is running' }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, department, phone, supervisorId } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      department: department || 'Computer Science',
      phone: phone || '',
      supervisorId: supervisorId || null
    });

    const token = createToken(user);
    res.status(201).json({ token, user: { ...normalizeUser(user), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = createToken(user);
    res.json({ token, user: { ...normalizeUser(user), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Missing token' });

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: normalizeUser(user) });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/api/users', async (_req, res) => {
  try {
    const users = await User.find({}).select('-password').lean();
    res.json(users.map(normalizeUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/tasks', async (_req, res) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 }).lean();
    res.json(tasks.map(normalizeTask));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, category, priority, deadline, assignedTo, createdBy } = req.body;
    const assignee = await User.findById(assignedTo);
    const creator = await User.findById(createdBy);

    if (!assignee || !creator) return res.status(400).json({ message: 'Invalid assignee or creator' });

    const task = await Task.create({
      title,
      description,
      category,
      priority,
      deadline,
      createdBy,
      assignedTo,
      assignedToName: assignee.name,
      assignedToRole: assignee.role,
      status: 'Pending'
    });

    const notification = await sendNotification({
      userId: assignee._id,
      type: 'Task Assigned',
      title: 'New Task Assigned',
      message: `${creator.name} assigned task "${task.title}" to you.`
    });

    await sendPendingTaskEmail(task);
    res.status(201).json({ task: normalizeTask(task), notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    const notifications = await Notification.find({ userId: payload.id }).sort({ createdAt: -1 }).lean();
    res.json(notifications.map(normalizeNotification));
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(notification ? normalizeNotification(notification) : null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/notifications/read-all', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    await Notification.updateMany({ userId: payload.id }, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

setInterval(async () => {
  const pendingTasks = await Task.find({ status: 'Pending' });
  for (const task of pendingTasks) {
    if (!task.reminderSent) {
      await sendPendingTaskEmail(task);
    }
  }
}, 60_000);

mongoose.connect(MONGODB_URI)
  .then(async () => {
    await seedUsers();
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed', error);
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
