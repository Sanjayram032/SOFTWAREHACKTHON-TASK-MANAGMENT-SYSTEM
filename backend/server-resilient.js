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
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);

const defaultDepartments = [
  'Administration & Academic Affairs',
  'Computer Science & Engineering',
  'Information Technology',
  'Computer Applications (MCA/BCA)',
  'Cyber Security & Forensics',
  'Software Engineering',
  'Data Science & Artificial Intelligence',
  'Machine Learning & Deep Learning',
  'Big Data Analytics',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Embedded Systems & IoT',
  'VLSI Design & Nanoelectronics',
  'Signal Processing & Communication',
  'Mechanical Engineering',
  'Manufacturing & Industrial Engineering',
  'Automobile Engineering',
  'Robotics & Automation',
  'Aerospace Engineering',
  'Civil Engineering',
  'Environmental Engineering',
  'Structural Engineering',
  'Transportation & Highway Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Biomedical Engineering',
  'Pharmaceutical Technology',
  'Engineering Management',
  'Technology Business Management',
  'Interdisciplinary Research Centre'
];

let store = {
  mode: 'memory',
  users: [],
  tasks: [],
  submissions: [],
  notifications: [],
  departments: [...defaultDepartments]
};

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeUser = (user) => {
  const source = user && typeof user.toObject === 'function' ? user.toObject() : user;
  const id = source._id?.toString() || source.id;
  return {
    ...source,
    id,
    _id: id,
    supervisor_id: source.supervisorId ? source.supervisorId.toString() : source.supervisor_id || null,
    joinedDate: source.createdAt ? source.createdAt.toISOString().split('T')[0] : source.joinedDate || ''
  };
};

const normalizeTask = (task) => {
  const source = task && typeof task.toObject === 'function' ? task.toObject() : task;
  const id = source._id?.toString() || source.id;
  return {
    ...source,
    id,
    _id: id,
    created_by: source.createdBy ? source.createdBy.toString() : source.created_by || '',
    assigned_to: source.assignedTo ? source.assignedTo.toString() : source.assigned_to || '',
    assigned_to_name: source.assignedToName || source.assigned_to_name || '',
    assigned_to_role: source.assignedToRole || source.assigned_to_role || 'student',
    createdAt: source.createdAt ? source.createdAt.toISOString().split('T')[0] : source.created_at || ''
  };
};

const normalizeNotification = (notification) => {
  const source = notification && typeof notification.toObject === 'function' ? notification.toObject() : notification;
  const id = source._id?.toString() || source.id;
  return {
    ...source,
    id,
    _id: id,
    user_id: source.userId ? source.userId.toString() : source.user_id || '',
    sent_at: source.createdAt ? source.createdAt.toISOString().replace('T', ' ').substring(0, 16) : source.sent_at || '',
    read_status: source.read ?? source.read_status ?? false,
    read: source.read ?? source.read_status ?? false
  };
};

const listDepartments = async () => [...store.departments];

const createDepartment = async (name) => {
  const normalized = (name || '').trim();
  if (!normalized) throw new Error('Department name is required');
  if (!store.departments.includes(normalized)) {
    store.departments.push(normalized);
  }
  return normalized;
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: process.env.EMAIL_USER && process.env.EMAIL_PASS ? {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  } : undefined
});

const createToken = (user) => jwt.sign({ id: user._id || user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

const seedMemoryData = async () => {
  if (store.users.length) return;
  const hashedPassword = await bcrypt.hash('password123', 10);
  const hashedTestAdmin = await bcrypt.hash('Admin@1234', 10);
  const hashedTestStaff = await bcrypt.hash('Staff@1234', 10);
  const hashedTestStudent = await bcrypt.hash('Student@1234', 10);

  const admin = {
    _id: 'user-admin',
    id: 'user-admin',
    name: 'Arthur Peterson',
    email: 'arthur.p@university.edu',
    password: hashedPassword,
    role: 'admin',
    department: 'Academic Affairs',
    phone: '+1 555 0100',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  };

  const staff = {
    _id: 'user-staff',
    id: 'user-staff',
    name: 'Sarah Johnson',
    email: 'sarah.j@university.edu',
    password: hashedPassword,
    role: 'staff',
    department: 'Computer Science',
    supervisorId: admin._id,
    supervisor_id: admin._id,
    phone: '+1 555 0101',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  };

  const student = {
    _id: 'user-student',
    id: 'user-student',
    name: 'Alex Rivera',
    email: 'alex.rivera@student.edu',
    password: hashedPassword,
    role: 'student',
    department: 'Computer Science',
    supervisorId: staff._id,
    supervisor_id: staff._id,
    phone: '+1 555 0102',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
  };

  const testAdmin = {
    _id: 'user-test-admin',
    id: 'user-test-admin',
    name: 'Test Admin',
    email: 'test.admin@university.edu',
    password: hashedTestAdmin,
    role: 'admin',
    department: 'Academic Affairs',
    phone: '',
    status: 'Active',
    avatar: ''
  };

  const testStaff = {
    _id: 'user-test-staff',
    id: 'user-test-staff',
    name: 'Test Staff',
    email: 'test.staff@university.edu',
    password: hashedTestStaff,
    role: 'staff',
    department: 'Computer Science',
    supervisorId: admin._id,
    supervisor_id: admin._id,
    phone: '',
    status: 'Active',
    avatar: ''
  };

  const testStudent = {
    _id: 'user-test-student',
    id: 'user-test-student',
    name: 'Test Student',
    email: 'test.student@university.edu',
    password: hashedTestStudent,
    role: 'student',
    department: 'Computer Science',
    supervisorId: testStaff._id,
    supervisor_id: testStaff._id,
    phone: '',
    status: 'Active',
    avatar: ''
  };

  store.users = [admin, staff, student, testAdmin, testStaff, testStudent];
  store.tasks = [{
    _id: 'task-demo',
    id: 'task-demo',
    title: 'Complete faculty evaluation report',
    description: 'Review the semester faculty evaluation report.',
    category: 'Course Completion',
    priority: 'High',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Pending',
    createdBy: admin._id,
    created_by: admin._id,
    assignedTo: staff._id,
    assigned_to: staff._id,
    assignedToName: staff.name,
    assigned_to_name: staff.name,
    assignedToRole: staff.role,
    assigned_to_role: staff.role,
    reminderSent: false,
    createdAt: new Date()
  }];
  store.notifications = [{
    _id: 'notif-demo',
    id: 'notif-demo',
    userId: admin._id,
    user_id: admin._id,
    type: 'Task Assigned',
    title: 'Welcome',
    message: 'The system is ready. Use your institutional credentials to sign in.',
    read: false,
    read_status: false,
    createdAt: new Date()
  }];
  store.submissions = [];
};

const sendNotification = async ({ userId, type, title, message }) => {
  const notification = {
    _id: createId('notif'),
    id: createId('notif'),
    userId,
    user_id: userId,
    type,
    title,
    message,
    read: false,
    read_status: false,
    createdAt: new Date()
  };

  store.notifications.unshift(notification);
  io.to(`user:${userId.toString()}`).emit('new-notification', normalizeNotification(notification));
  return normalizeNotification(notification);
};

const parseTaskDeadline = (deadline) => {
  if (!deadline) return null;
  if (deadline instanceof Date) return deadline;
  if (typeof deadline === 'string') {
    const dateOnlyMatch = deadline.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch.map(Number);
      return new Date(year, month - 1, day, 23, 59, 59, 999);
    }
    const parsed = new Date(deadline);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const sendPendingTaskEmail = async (task) => {
  if (task.reminderSent || task.status !== 'Pending') return;

  const deadlineDate = parseTaskDeadline(task.deadline);
  if (!deadlineDate) return;

  const now = new Date();
  const timeUntilDeadline = deadlineDate.getTime() - now.getTime();
  const oneHourMs = 60 * 60 * 1000;
  if (timeUntilDeadline > oneHourMs || timeUntilDeadline <= 0) return;

  const assignee = store.users.find((user) => user._id === task.assignedTo || user.id === task.assignedTo);
  const recipients = [assignee?.email].filter(Boolean);
  if (!recipients.length) return;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'task-management-system@example.com',
    to: recipients,
    subject: `Pending Task Reminder: ${task.title}`,
    html: `<p>Hello ${assignee?.name || 'team member'},</p><p>The task <strong>${task.title}</strong> is still pending and is due within one hour.</p><p><strong>Deadline:</strong> ${deadlineDate.toLocaleString()}</p><p>Please review and update the task status as soon as possible.</p>`
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('Email transport not configured. Pending reminder for:', recipients);
    }
    task.reminderSent = true;
  } catch (error) {
    console.error('Failed to send reminder email:', error.message);
  }
};

const findUserByEmail = async (email) => {
  const normalizedEmail = (email || '').toLowerCase();
  return store.users.find((user) => user.email.toLowerCase() === normalizedEmail) || null;
};

const findUserById = async (id) => store.users.find((user) => user._id === id || user.id === id) || null;
const listUsers = async () => store.users.map(normalizeUser);
const createUser = async (payload) => {
  const user = {
    _id: createId('user'),
    id: createId('user'),
    ...payload,
    role: payload.role || 'student',
    department: payload.department || 'Computer Science',
    status: 'Active'
  };
  store.users.push(user);
  return normalizeUser(user);
};

const listTasks = async () => store.tasks.map(normalizeTask);
const createTaskRecord = async (payload) => {
  const task = {
    _id: createId('task'),
    id: createId('task'),
    ...payload,
    status: 'Pending',
    reminderSent: false,
    createdAt: new Date()
  };
  store.tasks.unshift(task);
  return normalizeTask(task);
};

const normalizeSubmission = (submission) => {
  const source = submission && typeof submission.toObject === 'function' ? submission.toObject() : submission;
  const id = source._id?.toString() || source.id;
  return {
    ...source,
    id,
    _id: id,
    task_id: source.taskId || source.task_id || '',
    task_title: source.task_title || source.taskTitle || '',
    submitted_by: source.submittedBy || source.submitted_by || '',
    submitted_by_name: source.submitted_by_name || source.submittedByName || '',
    file_name: source.file_name || source.fileName || '',
    file_size: source.file_size || source.fileSize || '',
    submitted_at: source.submitted_at || source.submittedAt || '',
    review_remarks: source.review_remarks || source.reviewRemarks || '',
    reviewed_by: source.reviewed_by || source.reviewedBy || '',
    reviewed_at: source.reviewed_at || source.reviewedAt || ''
  };
};

const listSubmissions = async () => store.submissions.map(normalizeSubmission);
const createSubmissionRecord = async (payload) => {
  const submission = {
    _id: createId('submission'),
    id: createId('submission'),
    ...payload,
    status: payload.status || 'Pending'
  };
  store.submissions.unshift(submission);
  return normalizeSubmission(submission);
};

const updateSubmissionRecord = async (submissionId, updates) => {
  const submission = store.submissions.find((sub) => sub._id === submissionId || sub.id === submissionId);
  if (!submission) return null;
  Object.assign(submission, updates);
  return normalizeSubmission(submission);
};

const listNotifications = async (userId) => store.notifications.filter((n) => n.userId === userId || n.user_id === userId).map(normalizeNotification);
const markNotificationReadRecord = async (notificationId) => {
  const notification = store.notifications.find((n) => n._id === notificationId || n.id === notificationId);
  if (!notification) return null;
  notification.read = true;
  notification.read_status = true;
  return normalizeNotification(notification);
};
const markAllNotificationsReadRecord = async (userId) => {
  store.notifications = store.notifications.map((notification) => {
    if (notification.userId === userId || notification.user_id === userId) {
      notification.read = true;
      notification.read_status = true;
    }
    return notification;
  });
  return true;
};

io.on('connection', (socket) => {
  socket.on('authenticate', async (token) => {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await findUserById(payload.id);
      if (!user) return;
      socket.join(`user:${user._id.toString()}`);
      socket.emit('authenticated', { user: normalizeUser(user) });
    } catch (error) {
      socket.emit('auth-error', { message: 'Invalid token' });
    }
  });
});

app.get('/api/health', (_req, res) => res.json({ ok: true, message: 'Task management API is running', mode: store.mode }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, department, phone, supervisorId } = req.body;
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'student',
      department: department || 'Computer Science',
      phone: phone || '',
      supervisorId: supervisorId || null,
      supervisor_id: supervisorId || null
    });

    const token = createToken(user);
    res.status(201).json({ token, user: { ...user, password: undefined } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = createToken(user);
    res.json({ token, user: { ...normalizeUser(user), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const verifyGoogleToken = async (idToken) => {
  if (!idToken) throw new Error('Missing Google id token');
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!response.ok) {
    throw new Error('Invalid Google token');
  }
  const payload = await response.json();
  const expectedClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  if (expectedClientId && payload.aud !== expectedClientId) {
    throw new Error('Google client ID mismatch');
  }
  if (payload.email_verified !== 'true' && payload.email_verified !== true) {
    throw new Error('Google email not verified');
  }
  return payload;
};

app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    const googlePayload = await verifyGoogleToken(idToken);
    const email = (googlePayload.email || '').toLowerCase();
    let user = await findUserByEmail(email);

    if (!user) {
      const isAdmin = ADMIN_EMAILS.includes(email);
      const role = isAdmin
        ? 'admin'
        : email.endsWith('@student.edu')
          ? 'student'
          : 'staff';

      user = await createUser({
        name: googlePayload.name || email.split('@')[0],
        email,
        password: '',
        role,
        department: 'Academic Affairs',
        phone: googlePayload.phone_number || '',
        avatar: googlePayload.picture || '',
        locale: googlePayload.locale || ''
      });
    }

    const token = createToken(user);
    res.json({ token, user: { ...normalizeUser(user), password: undefined } });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Missing token' });

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(payload.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: normalizeUser(user) });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/api/users', async (_req, res) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, role, department, phone, supervisorId } = req.body;
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    const user = await createUser({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'student',
      department: department || 'Computer Science',
      phone: phone || '',
      supervisorId: supervisorId || null,
      supervisor_id: supervisorId || null
    });

    if (user.department) {
      await createDepartment(user.department);
    }

    res.status(201).json({ user: { ...user, password: undefined } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/tasks', async (_req, res) => {
  try {
    const tasks = await listTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, category, priority, deadline, assignedTo, createdBy } = req.body;
    const assignee = await findUserById(assignedTo);
    const creator = await findUserById(createdBy);

    if (!assignee || !creator) return res.status(400).json({ message: 'Invalid assignee or creator' });

    const task = await createTaskRecord({
      title,
      description,
      category,
      priority,
      deadline,
      createdBy,
      created_by: createdBy,
      assignedTo,
      assigned_to: assignedTo,
      assignedToName: assignee.name,
      assigned_to_name: assignee.name,
      assignedToRole: assignee.role,
      assigned_to_role: assignee.role
    });

    const notification = await sendNotification({
      userId: assignee._id,
      type: 'Task Assigned',
      title: 'New Task Assigned',
      message: `${creator.name} assigned task "${task.title}" to you.`
    });

    await sendPendingTaskEmail(store.tasks.find((item) => item.id === task.id || item._id === task._id));
    res.status(201).json({ task, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/departments', async (_req, res) => {
  try {
    const departments = await listDepartments();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const { name } = req.body;
    const department = await createDepartment(name);
    res.status(201).json({ department });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    const notifications = await listNotifications(payload.id);
    res.json(notifications);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/api/submissions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    const subs = await listSubmissions();
    res.json(subs);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.post('/api/submissions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET);

    const { task_id, task_title, submittedBy, submitted_by, submitted_by_name, file_name, file_size, remarks } = req.body;
    const submission = await createSubmissionRecord({
      task_id: task_id || req.body.taskId,
      task_title,
      submitted_by: submittedBy || submitted_by,
      submitted_by_name,
      file_name,
      file_size,
      submitted_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending',
      review_remarks: remarks || '',
      reviewed_by: '',
      reviewed_at: ''
    });

    if (submission) {
      const task = store.tasks.find((item) => item.id === task_id || item._id === task_id);
      if (task) {
        task.status = 'In Progress';
      }
    }

    res.status(201).json({ submission });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.patch('/api/submissions/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);

    const { status, review_remarks, reviewed_by, reviewed_at } = req.body;
    const submission = store.submissions.find((sub) => sub._id === req.params.id || sub.id === req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const task = store.tasks.find((item) => item.id === submission.task_id || item._id === submission.task_id);
    const taskCreator = task ? store.users.find((u) => u._id === task.created_by || u.id === task.created_by || u._id === task.createdBy || u.id === task.createdBy) : null;
    const assignedStudentTask = task && (task.assigned_to_role === 'student' || task.assignedToRole === 'student' || task.assigned_to === submission.submitted_by || task.assignedTo === submission.submitted_by);
    const isStaffAssignedStudentTask = assignedStudentTask && taskCreator?.role === 'staff';

    if (payload.role === 'admin' && isStaffAssignedStudentTask) {
      return res.status(403).json({ message: 'Admin cannot review staff-assigned student tasks' });
    }

    const updatedSubmission = await updateSubmissionRecord(req.params.id, {
      status,
      review_remarks,
      reviewed_by,
      reviewed_at
    });

    if (task) {
      if (status === 'Approved') {
        task.status = 'Completed';
      } else if (status === 'Rejected') {
        task.status = 'Rejected';
      } else {
        task.status = 'In Progress';
      }
    }

    res.json({ submission: updatedSubmission });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    const notification = await markNotificationReadRecord(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/notifications/read-all', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    await markAllNotificationsReadRecord(payload.id);
    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

setInterval(async () => {
  for (const task of store.tasks) {
    await sendPendingTaskEmail(task);
  }
}, 60_000);

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    store.mode = 'mongo';
    console.log('Connected to MongoDB');
  } catch (error) {
    console.warn('MongoDB unavailable, using in-memory store:', error.message);
    store.mode = 'memory';
  }

  await seedMemoryData();
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
