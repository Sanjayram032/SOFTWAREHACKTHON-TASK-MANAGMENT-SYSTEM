import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
// Sequelize removed — using Firestore via firebase-admin instead
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import http from 'http';
import { Server } from 'socket.io';
import nodemailer from 'nodemailer';
import admin from 'firebase-admin';

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
const DB_DIALECT = process.env.DB_DIALECT || 'sqlite';
const MYSQL_URI = process.env.MYSQL_URI || 'mysql://root:root@127.0.0.1:3306/tms';
const SQLITE_STORAGE = process.env.SQLITE_STORAGE || 'backend/database.sqlite';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
let firebaseAdminConfig = null;

if (serviceAccountPath) {
  try {
    const fullPath = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.resolve(process.cwd(), serviceAccountPath);
    const serviceAccountJson = fs.readFileSync(fullPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);
    firebaseAdminConfig = { credential: admin.credential.cert(serviceAccount) };
  } catch (error) {
    console.warn('Failed to load Firebase service account file:', error.message);
  }
}

if (!firebaseAdminConfig) {
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, '\n') : undefined;
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    firebaseAdminConfig = {
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey
      })
    };
  }
}

if (firebaseAdminConfig) {
  admin.initializeApp(firebaseAdminConfig);
} else {
  console.warn('Firebase Admin SDK is not fully configured. Firebase ID token verification will fail.');
}

// Firestore-backed collections (users, tasks, notifications, departments, submissions)
const db = admin.apps.length ? admin.firestore() : null;
if (!db) console.warn('Firestore not initialized; persistent data will not be stored.');

const docToObject = (docSnap, collectionName) => {
  const data = docSnap.data() || {};
  const obj = { ...data, id: docSnap.id };
  obj.update = async (fields) => {
    if (!db) throw new Error('Firestore not initialized');
    await db.collection(collectionName).doc(obj.id).update(fields);
    Object.assign(obj, fields);
    return obj;
  };
  return obj;
};

const makeCollection = (name) => ({
  findOne: async ({ where } = {}) => {
    if (!db) return null;
    if (where && where.email) {
      const q = await db.collection(name).where('email', '==', where.email).limit(1).get();
      if (q.empty) return null;
      return docToObject(q.docs[0], name);
    }
    return null;
  },
  findByPk: async (id) => {
    if (!db) return null;
    const snap = await db.collection(name).doc(String(id)).get();
    if (!snap.exists) return null;
    return docToObject(snap, name);
  },
  create: async (data) => {
    if (!db) return null;
    const toSave = { ...data, createdAt: new Date().toISOString() };
    const ref = await db.collection(name).add(toSave);
    const snap = await ref.get();
    return docToObject(snap, name);
  },
  findAll: async (opts = {}) => {
    if (!db) return [];
    let ref = db.collection(name);
    if (opts.where) {
      Object.entries(opts.where).forEach(([k, v]) => {
        ref = ref.where(k, '==', v);
      });
    }
    const snaps = await ref.get();
    return snaps.docs.map(d => docToObject(d, name));
  },
  updateById: async (id, fields) => {
    if (!db) throw new Error('Firestore not initialized');
    await db.collection(name).doc(String(id)).update(fields);
    const snap = await db.collection(name).doc(String(id)).get();
    return docToObject(snap, name);
  }
});

const User = makeCollection('users');
const Task = makeCollection('tasks');
const Notification = makeCollection('notifications');
const Department = makeCollection('departments');
const Submission = makeCollection('submissions');

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
  const createdAt = source.createdAt;
  let joinedDate = '';

  if (createdAt) {
    try {
      joinedDate = typeof createdAt === 'string'
        ? new Date(createdAt).toISOString().split('T')[0]
        : createdAt.toISOString().split('T')[0];
    } catch {
      joinedDate = String(createdAt);
    }
  }

  return {
    ...source,
    id: source.id?.toString(),
    supervisor_id: source.supervisorId ? source.supervisorId.toString() : null,
    joinedDate
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = createToken(user);
    res.json({ token, user: { ...normalizeUser(user), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const firebasePublicKeysCache = {
  keys: null,
  expiresAt: 0
};

const fetchFirebasePublicKeys = async () => {
  const now = Date.now();
  if (firebasePublicKeysCache.keys && firebasePublicKeysCache.expiresAt > now) {
    return firebasePublicKeysCache.keys;
  }

  const response = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  if (!response.ok) {
    throw new Error('Unable to retrieve Firebase public keys');
  }

  const keys = await response.json();
  const cacheControl = response.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAge = maxAgeMatch ? Number(maxAgeMatch[1]) : 0;
  firebasePublicKeysCache.keys = keys;
  firebasePublicKeysCache.expiresAt = now + (maxAge * 1000);
  return keys;
};

const verifyFirebaseIdToken = async (idToken) => {
  if (!idToken) throw new Error('Missing auth token');

  try {
    if (!admin.apps.length) throw new Error('Firebase Admin SDK is not initialized');
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (!decodedToken.email_verified && decodedToken.email_verified !== true) {
      throw new Error('Email not verified');
    }
    return decodedToken;
  } catch (adminError) {
    const fallbackAllowed = adminError.message?.includes('incorrect "aud"') || adminError.message?.includes('Invalid project ID');
    if (!fallbackAllowed) {
      throw adminError;
    }

    const decoded = jwt.decode(idToken, { complete: true });
    if (!decoded || !decoded.payload || !decoded.header) {
      throw new Error('Invalid Firebase ID token');
    }

    const { aud, iss, email_verified } = decoded.payload;
    if (!aud || !iss || iss !== `https://securetoken.google.com/${aud}`) {
      throw new Error('Invalid Firebase token issuer/audience');
    }

    const keys = await fetchFirebasePublicKeys();
    const cert = keys[decoded.header.kid];
    if (!cert) {
      throw new Error('Could not find public key for Firebase token');
    }

    const payload = jwt.verify(idToken, cert, {
      algorithms: ['RS256'],
      audience: aud,
      issuer: `https://securetoken.google.com/${aud}`
    });

    if (!payload.email_verified && payload.email_verified !== true) {
      throw new Error('Email not verified');
    }

    return payload;
  }
};

app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken, preferredRole } = req.body;
    const decodedToken = await verifyFirebaseIdToken(idToken);
    const email = (decodedToken.email || '').toLowerCase();
    let user = await User.findOne({ where: { email } });

    if (!user) {
      if (!preferredRole) {
        return res.json({
          needsRole: true,
          email,
          name: decodedToken.name || '',
          picture: decodedToken.picture || ''
        });
      }

      const role = ['admin', 'staff', 'student'].includes(preferredRole) ? preferredRole : 'student';
      const hashedPassword = await bcrypt.hash('firebase-user-password', 10);
      user = await User.create({
        name: decodedToken.name || email.split('@')[0],
        email,
        password: hashedPassword,
        role,
        department: 'Academic Affairs',
        phone: decodedToken.phone_number || '',
        avatar: decodedToken.picture || ''
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

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, role, department, phone, supervisorId } = req.body;
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'student',
      department: department || 'Computer Science',
      phone: phone || '',
      supervisorId: supervisorId || null
    });

    res.status(201).json({ user: normalizeUser(user) });
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
    await seedUsers();
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Backend startup failed', error);
    process.exit(1);
  }
};

startServer();
