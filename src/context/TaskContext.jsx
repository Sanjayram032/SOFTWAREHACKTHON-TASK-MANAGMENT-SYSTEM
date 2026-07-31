import React, { createContext, useContext, useState } from 'react';
import { 
  initialUsers, 
  initialTasks, 
  initialSubmissions, 
  initialNotifications, 
  initialQueries, 
  initialAuditLogs 
} from '../data/dummyData';
import { initialDepartments } from '../data/departments';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [users, setUsers] = useState(initialUsers);
  const [tasks, setTasks] = useState(initialTasks);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [queries, setQueries] = useState(initialQueries);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [departments, setDepartments] = useState(initialDepartments);

  // Helper to add audit log
  const logAuditAction = (userName, action, entityType, entityId, details) => {
    const newLog = {
      id: `log-${Date.now()}`,
      user_name: userName,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Helper to trigger notification
  const addNotification = (userId, type, title, message) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      user_id: userId,
      type,
      title,
      message,
      sent_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read_status: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Add a new department (Admin only) — must be after logAuditAction
  const addDepartment = (name, creatorUser) => {
    const trimmed = name.trim();
    if (!trimmed || departments.includes(trimmed)) return false;
    setDepartments(prev => [...prev, trimmed]);
    logAuditAction(
      creatorUser.name,
      'Department Added',
      'Department',
      trimmed,
      `Added new department: "${trimmed}"`
    );
    return true;
  };


  // 1. Create Task (Admin or Staff)
  const createTask = (taskData, creatorUser) => {
    const assignee = users.find(u => u.id === taskData.assigned_to);
    const newTask = {
      id: `tsk-${Math.floor(1000 + Math.random() * 9000)}`,
      title: taskData.title,
      description: taskData.description || '',
      category: taskData.category || 'Subject Assignment',
      priority: taskData.priority || 'Medium',
      deadline: taskData.deadline,
      created_by: creatorUser.id,
      assigned_to: taskData.assigned_to,
      assigned_to_name: assignee ? assignee.name : 'Unassigned',
      assigned_to_role: assignee ? assignee.role : 'student',
      status: 'Pending',
      parent_task_id: taskData.parent_task_id || null,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTasks(prev => [newTask, ...prev]);

    // Audit log & notification
    logAuditAction(
      creatorUser.name, 
      'Task Creation', 
      'Task', 
      newTask.id, 
      `Created task "${newTask.title}" assigned to ${newTask.assigned_to_name}`
    );

    if (assignee) {
      addNotification(
        assignee.id,
        'Task Assigned',
        'New Task Assigned',
        `${creatorUser.name} assigned task "${newTask.title}" to you.`
      );
    }

    return newTask;
  };

  // 2. Add User (Admin)
  const addUser = (userData, creatorUser) => {
    const newUser = {
      id: `u-${Math.floor(100 + Math.random() * 900)}`,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'student',
      department: userData.department || 'Computer Science',
      status: 'Active',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random()*1000)}?w=150&auto=format&fit=crop&q=80`,
      supervisor_id: userData.supervisor_id || 'u-2',
      phone: userData.phone || '+1 (555) 000-1122',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [...prev, newUser]);

    logAuditAction(
      creatorUser.name,
      'User Onboarding',
      'User',
      newUser.id,
      `Created new ${newUser.role} account for ${newUser.name}`
    );

    return newUser;
  };

  // 3. Submit Proof (Student)
  const submitProof = (proofData, studentUser) => {
    const targetTask = tasks.find(t => t.id === proofData.task_id);
    const newSubmission = {
      id: `sub-${Math.floor(1000 + Math.random() * 9000)}`,
      task_id: proofData.task_id,
      task_title: targetTask ? targetTask.title : 'Task Proof',
      submitted_by: studentUser.id,
      submitted_by_name: studentUser.name,
      file_name: proofData.file_name || 'proof_document.pdf',
      file_url: '#',
      file_size: proofData.file_size || '1.5 MB',
      submitted_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending',
      review_remarks: '',
      reviewed_by: '',
      reviewed_at: ''
    };

    setSubmissions(prev => [newSubmission, ...prev]);

    // Update Task status to 'In Progress' or 'Pending Review'
    setTasks(prev => prev.map(t => t.id === proofData.task_id ? { ...t, status: 'In Progress' } : t));

    logAuditAction(
      studentUser.name,
      'Proof Submission',
      'Submission',
      newSubmission.id,
      `Uploaded proof file "${newSubmission.file_name}" for task "${newSubmission.task_title}"`
    );

    // Notify Staff Supervisor
    if (studentUser.supervisor_id) {
      addNotification(
        studentUser.supervisor_id,
        'Task Submission',
        'Submission Received',
        `${studentUser.name} submitted proof for task "${newSubmission.task_title}"`
      );
    }
  };

  // 4. Review Submission (Staff / Admin)
  const reviewSubmission = (submissionId, status, remarks, reviewerUser) => {
    let targetSubmission = null;

    setSubmissions(prev => prev.map(sub => {
      if (sub.id === submissionId) {
        targetSubmission = {
          ...sub,
          status,
          review_remarks: remarks,
          reviewed_by: reviewerUser.name,
          reviewed_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        return targetSubmission;
      }
      return sub;
    }));

    if (targetSubmission) {
      // Update Task status: Approved -> Completed, Rejected -> Rejected
      const newStatus = status === 'Approved' ? 'Completed' : 'Rejected';
      setTasks(prev => prev.map(t => t.id === targetSubmission.task_id ? { ...t, status: newStatus } : t));

      logAuditAction(
        reviewerUser.name,
        'Submission Review',
        'Submission',
        targetSubmission.id,
        `Marked submission as ${status} with remarks: "${remarks}"`
      );

      // Notify Student
      const notifType = status === 'Approved' ? 'Submission Approved' : 'Submission Rejected';
      addNotification(
        targetSubmission.submitted_by,
        notifType,
        `Submission ${status}`,
        `${reviewerUser.name} ${status.toLowerCase()} your submission for "${targetSubmission.task_title}".`
      );
    }
  };

  // 5. Raise Query (Staff)
  const raiseQuery = (queryData, staffUser) => {
    const targetTask = tasks.find(t => t.id === queryData.task_id);
    const newQuery = {
      id: `q-${Date.now()}`,
      raised_by: staffUser.id,
      raised_by_name: staffUser.name,
      raised_to: 'u-1', // Admin
      task_id: queryData.task_id,
      task_title: targetTask ? targetTask.title : 'General Task',
      subject: queryData.subject,
      message: queryData.message,
      status: 'Open',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      responses: []
    };

    setQueries(prev => [newQuery, ...prev]);

    logAuditAction(
      staffUser.name,
      'Query Raised',
      'Query',
      newQuery.id,
      `Raised escalation query: "${newQuery.subject}"`
    );

    addNotification(
      'u-1',
      'Query Escalation',
      'New Query Escalation',
      `${staffUser.name} raised query "${newQuery.subject}".`
    );
  };

  // 6. Respond to Query (Admin)
  const respondToQuery = (queryId, responseText, adminUser) => {
    setQueries(prev => prev.map(q => {
      if (q.id === queryId) {
        const updatedResponses = [
          ...q.responses,
          {
            sender: adminUser.name,
            sender_role: 'admin',
            message: responseText,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
          }
        ];
        return { ...q, status: 'Responded', responses: updatedResponses };
      }
      return q;
    }));
  };

  // 7. Notification actions
  const markNotificationRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read_status: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read_status: true })));
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
