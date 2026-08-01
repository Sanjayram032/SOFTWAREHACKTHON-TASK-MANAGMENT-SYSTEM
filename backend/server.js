import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Sequelize, DataTypes } from 'sequelize';
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
const MYSQL_URI = process.env.MYSQL_URI || 'mysql://root:root@127.0.0.1:3306/tms';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const parseMysqlUri = () => {
  try {
    const url = new URL(MYSQL_URI);
    const dbName = url.pathname ? url.pathname.replace(/^\//, '') : '';
    const uriWithoutDb = `${url.protocol}//${url.username}:${url.password}@${url.hostname}${url.port ? `:${url.port}` : ''}/`;
    return { dbName, uriWithoutDb };
  } catch (error) {
    throw new Error('Invalid MYSQL_URI format');
  }
};

const { dbName, uriWithoutDb } = parseMysqlUri();

const createDatabaseIfMissing = async () => {
  if (!dbName) return;

  const sequelizeNoDb = new Sequelize(uriWithoutDb, {
    dialect: 'mysql',
    logging: false
  });

  try {
    await sequelizeNoDb.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  } finally {
    await sequelizeNoDb.close();
  }
};

const sequelize = new Sequelize(MYSQL_URI, {
  dialect: 'mysql',
  logging: false
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('email', value.toLowerCase());
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'staff', 'student'),
    defaultValue: 'student'
  },
  department: {
    type: DataTypes.STRING,
    defaultValue: 'Computer Science'
  },
  supervisorId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  phone: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active'
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: ''
  }
}, {
  tableName: 'users',
  timestamps: true
});

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'Subject Assignment'
  },
  priority: {
    type: DataTypes.STRING,
    defaultValue: 'Medium'
  },
  deadline: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending'
  },
  createdBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assignedTo: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assignedToName: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  assignedToRole: {
    type: DataTypes.STRING,
    defaultValue: 'student'
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'tasks',
  timestamps: true
});

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'Task Assigned'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'notifications',
  timestamps: true
});

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'departments',
  timestamps: true
});

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  task_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  task_title: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  submitted_by: {
    type: DataTypes.STRING,
    allowNull: false
  },
  submitted_by_name: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  file_name: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  file_size: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  remarks: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  submitted_at: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending'
  },
  review_remarks: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  reviewed_by: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  reviewed_at: {
    type: DataTypes.STRING,
    defaultValue: ''
  }
}, {
  tableName: 'submissions',
  timestamps: true
});

User.hasMany(User, { as: 'subordinates', foreignKey: 'supervisorId' });
User.belongsTo(User, { as: 'supervisor', foreignKey: 'supervisorId' });
Task.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });
Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(Task, { as: 'createdTasks', foreignKey: 'createdBy' });
User.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assignedTo' });
User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: process.env.EMAIL_USER && process.env.EMAIL_PASS ? {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  } : undefined
});

const createToken = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

const normalizeUser = (user) => {
  const source = typeof user?.toJSON === 'function' ? user.toJSON() : user;
  return {
    ...source,
    id: source.id?.toString(),
    supervisor_id: source.supervisorId ? source.supervisorId.toString() : null,
    joinedDate: source.createdAt ? source.createdAt.toISOString().split('T')[0] : ''
  };
};

const normalizeTask = (task) => {
  const source = typeof task?.toJSON === 'function' ? task.toJSON() : task;
  return {
    ...source,
    id: source.id?.toString(),
    created_by: source.createdBy ? source.createdBy.toString() : '',
    assigned_to: source.assignedTo ? source.assignedTo.toString() : '',
    assigned_to_name: source.assignedToName || '',
    assigned_to_role: source.assignedToRole || 'student',
    createdAt: source.createdAt ? source.createdAt.toISOString().split('T')[0] : ''
  };
};

const normalizeNotification = (notification) => {
  const source = typeof notification?.toJSON === 'function' ? notification.toJSON() : notification;
  return {
    ...source,
    id: source.id?.toString(),
    user_id: source.userId ? source.userId.toString() : '',
    sent_at: source.createdAt ? source.createdAt.toISOString().replace('T', ' ').substring(0, 16) : '',
    read_status: source.read,
    read: source.read
  };
};

const normalizeSubmission = (submission) => {
  const source = typeof submission?.toJSON === 'function' ? submission.toJSON() : submission;
  return {
    ...source,
    id: source.id?.toString()
  };
};

const normalizeDepartment = (department) => {
  const source = typeof department?.toJSON === 'function' ? department.toJSON() : department;
  return source.name;
};

const sendNotification = async ({ userId, type, title, message }) => {
  const notification = await Notification.create({ userId, type, title, message });
  const payload = normalizeNotification(notification);
  io.to(`user:${userId}`).emit('new-notification', payload);
  return payload;
};

const sendPendingTaskEmail = async (task) => {
  if (task.reminderSent) return;

  const assignee = await User.findByPk(task.assignedTo);
  const supervisor = assignee?.supervisorId ? await User.findByPk(assignee.supervisorId) : null;
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
    await task.update({ reminderSent: true });
  } catch (error) {
    console.error('Failed to send reminder email:', error.message);
  }
};

const seedUsers = async () => {
  try {
    const testAccounts = [
      { name: 'Test Admin', email: 'test.admin@university.edu', password: 'Admin@1234', role: 'admin' },
      { name: 'Test Staff', email: 'test.staff@university.edu', password: 'Staff@1234', role: 'staff' },
      { name: 'Test Student', email: 'test.student@university.edu', password: 'Student@1234', role: 'student' }
    ];

    for (const acc of testAccounts) {
      const existing = await User.findOne({ where: { email: acc.email.toLowerCase() } });
      if (existing) {
        console.log(`Seed: user already exists - ${acc.email}`);
        continue;
      }

      const hashed = await bcrypt.hash(acc.password, 10);
      await User.create({
        name: acc.name,
        email: acc.email.toLowerCase(),
        password: hashed,
        role: acc.role
      });
      console.log(`Seed: created user ${acc.email} (role=${acc.role})`);
    }
  } catch (error) {
    console.error('Seed users failed:', error.message);
  }
};

io.on('connection', (socket) => {
  socket.on('authenticate', async (token) => {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(payload.id, { attributes: { exclude: ['password'] } });
      if (!user) return;
      socket.join(`user:${user.id}`);
      socket.emit('authenticated', { user: normalizeUser(user) });
    } catch (error) {
      socket.emit('auth-error', { message: 'Invalid token' });
    }
  });
});

app.get('/api/health', (_req, res) => res.json({ ok: true, message: 'Task management API is running' }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, department, phone, supervisorId } = req.body;
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
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
    const { idToken, preferredRole } = req.body;
    const googlePayload = await verifyGoogleToken(idToken);
    const email = (googlePayload.email || '').toLowerCase();
    let user = await User.findOne({ where: { email } });

    if (!user) {
      if (!preferredRole) {
        return res.json({
          needsRole: true,
          email,
          name: googlePayload.name || '',
          picture: googlePayload.picture || ''
        });
      }

      const role = ['admin', 'staff', 'student'].includes(preferredRole) ? preferredRole : 'student';
      const hashedPassword = await bcrypt.hash('google-user-password', 10);
      user = await User.create({
        name: googlePayload.name || email.split('@')[0],
        email,
        password: hashedPassword,
        role,
        department: 'Academic Affairs',
        phone: googlePayload.phone_number || '',
        avatar: googlePayload.picture || ''
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
    const user = await User.findByPk(payload.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: normalizeUser(user) });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/api/users', async (_req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users.map(normalizeUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/tasks', async (_req, res) => {
  try {
    const tasks = await Task.findAll({ order: [['createdAt', 'DESC']] });
    res.json(tasks.map(normalizeTask));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, category, priority, deadline, assignedTo, createdBy } = req.body;
    const assignee = await User.findByPk(assignedTo);
    const creator = await User.findByPk(createdBy);

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
      userId: assignee.id,
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

app.get('/api/departments', async (_req, res) => {
  try {
    const departments = await Department.findAll({ order: [['name', 'ASC']] });
    res.json(departments.map(normalizeDepartment));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name is required' });
    const [department] = await Department.findOrCreate({ where: { name } });
    res.status(201).json({ department: normalizeDepartment(department) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/submissions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET);
    const subs = await Submission.findAll({ order: [['createdAt', 'DESC']] });
    res.json(subs.map(normalizeSubmission));
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.post('/api/submissions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET);

    const {
      task_id,
      task_title,
      submittedBy,
      submitted_by,
      submitted_by_name,
      file_name,
      file_size,
      remarks
    } = req.body;

    const submission = await Submission.create({
      task_id: task_id || req.body.taskId || '',
      task_title: task_title || '',
      submitted_by: submittedBy || submitted_by || '',
      submitted_by_name: submitted_by_name || '',
      file_name: file_name || '',
      file_size: file_size || '',
      remarks: remarks || '',
      submitted_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending',
      review_remarks: '',
      reviewed_by: '',
      reviewed_at: ''
    });

    res.status(201).json({ submission: normalizeSubmission(submission) });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.patch('/api/submissions/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET);

    const { status, review_remarks, reviewed_by, reviewed_at } = req.body;
    const submission = await Submission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    await submission.update({
      status: status || submission.status,
      review_remarks: review_remarks || submission.review_remarks,
      reviewed_by: reviewed_by || submission.reviewed_by,
      reviewed_at: reviewed_at || submission.reviewed_at
    });

    res.json({ submission: normalizeSubmission(submission) });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    const notifications = await Notification.findAll({ where: { userId: payload.id }, order: [['createdAt', 'DESC']] });
    res.json(notifications.map(normalizeNotification));
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    await notification.update({ read: true });
    res.json(normalizeNotification(notification));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/notifications/read-all', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    await Notification.update({ read: true }, { where: { userId: payload.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

setInterval(async () => {
  const pendingTasks = await Task.findAll({ where: { status: 'Pending' } });
  for (const task of pendingTasks) {
    if (!task.reminderSent) {
      await sendPendingTaskEmail(task);
    }
  }
}, 60_000);

const startServer = async () => {
  try {
    await createDatabaseIfMissing();
    await sequelize.authenticate();
    await sequelize.sync();
    await seedUsers();
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MySQL connection failed', error);
    process.exit(1);
  }
};

startServer();
