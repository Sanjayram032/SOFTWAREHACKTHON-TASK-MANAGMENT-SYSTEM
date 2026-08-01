import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [queries, setQueries] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [departments, setDepartments] = useState([]);

  const loadData = async () => {
    const token = localStorage.getItem('tms_token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [usersRes, tasksRes, notificationsRes, departmentsRes] = await Promise.all([
        fetch('/api/users', { headers }),
        fetch('/api/tasks', { headers }),
        fetch('/api/notifications', { headers }),
        fetch('/api/departments', { headers })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (notificationsRes.ok) setNotifications(await notificationsRes.json());
      if (departmentsRes.ok) setDepartments(await departmentsRes.json());
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  const addUser = async (userData) => {
    const token = localStorage.getItem('tms_token');
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...userData,
        password: userData.password || 'password123'
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create user');
    }

    setUsers((prev) => [data.user, ...prev]);
    if (data.user?.department && !departments.includes(data.user.department)) {
      setDepartments((prev) => [...prev, data.user.department]);
    }
    return data.user;
  };

  const addDepartment = async (departmentName) => {
    const token = localStorage.getItem('tms_token');
    const response = await fetch('/api/departments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: departmentName })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to add department');
    }

    if (!departments.includes(data.department)) {
      setDepartments((prev) => [...prev, data.department]);
    }
    return data.department;
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const socket = io('http://localhost:5000');
    socket.emit('authenticate', localStorage.getItem('tms_token'));
    socket.on('new-notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });
    return () => socket.disconnect();
  }, [currentUser]);

  const createTask = async (taskData, creatorUser) => {
    const token = localStorage.getItem('tms_token');
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...taskData,
        createdBy: creatorUser._id || creatorUser.id,
        assignedTo: taskData.assigned_to
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create task');
    setTasks(prev => [data.task, ...prev]);
    return data.task;
  };

  const updateTaskStatus = (taskId, status) => {
    setTasks((prev) => prev.map((task) => {
      if (task.id === taskId || task._id === taskId) {
        return { ...task, status };
      }
      return task;
    }));
  };

  const submitProof = () => null;
  const reviewSubmission = () => null;
  const raiseQuery = () => null;
  const respondToQuery = () => null;

  const markNotificationRead = async (notifId) => {
    const token = localStorage.getItem('tms_token');
    await fetch(`/api/notifications/${notifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(prev => prev.map(n => (n._id === notifId || n.id === notifId ? { ...n, read: true, read_status: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    const token = localStorage.getItem('tms_token');
    await fetch('/api/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true, read_status: true })));
  };

  return (
    <TaskContext.Provider value={{
      users,
      tasks,
      submissions,
      notifications,
      queries,
      auditLogs,
      departments,
      createTask,
      updateTaskStatus,
      addUser,
      addDepartment,
      submitProof,
      reviewSubmission,
      raiseQuery,
      respondToQuery,
      markNotificationRead,
      markAllNotificationsRead
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => useContext(TaskContext);
