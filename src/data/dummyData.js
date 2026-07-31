// Dummy Users Dataset
export const initialUsers = [
  {
    id: 'u-1',
    name: 'Dr. Arthur Pendelton',
    email: 'arthur.p@university.edu',
    role: 'admin',
    department: 'Administration & Academic Affairs',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    supervisor_id: null,
    phone: '+1 (555) 019-2834',
    joinedDate: '2022-01-15'
  },
  {
    id: 'u-2',
    name: 'Prof. Sarah Jenkins',
    email: 'sarah.j@university.edu',
    role: 'staff',
    department: 'Computer Science',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    supervisor_id: 'u-1',
    phone: '+1 (555) 014-9921',
    joinedDate: '2022-08-10'
  },
  {
    id: 'u-3',
    name: 'Dr. Robert Chen',
    email: 'robert.c@university.edu',
    role: 'staff',
    department: 'Data Science & AI',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    supervisor_id: 'u-1',
    phone: '+1 (555) 018-3342',
    joinedDate: '2023-02-01'
  },
  {
    id: 'u-4',
    name: 'Prof. Elena Rostova',
    email: 'elena.r@university.edu',
    role: 'staff',
    department: 'Electrical Engineering',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    supervisor_id: 'u-1',
    phone: '+1 (555) 012-7741',
    joinedDate: '2023-06-15'
  },
  {
    id: 'u-5',
    name: 'Alex Rivera',
    email: 'alex.rivera@student.edu',
    role: 'student',
    department: 'Computer Science',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    supervisor_id: 'u-2',
    phone: '+1 (555) 017-8822',
    joinedDate: '2024-09-01'
  },
  {
    id: 'u-6',
    name: 'Sophia Martinez',
    email: 'sophia.m@student.edu',
    role: 'student',
    department: 'Computer Science',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    supervisor_id: 'u-2',
    phone: '+1 (555) 016-5531',
    joinedDate: '2024-09-01'
  },
  {
    id: 'u-7',
    name: 'David Kim',
    email: 'david.kim@student.edu',
    role: 'student',
    department: 'Data Science & AI',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    supervisor_id: 'u-3',
    phone: '+1 (555) 011-4490',
    joinedDate: '2024-09-01'
  },
  {
    id: 'u-8',
    name: 'Emily Watson',
    email: 'emily.w@student.edu',
    role: 'student',
    department: 'Electrical Engineering',
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    supervisor_id: 'u-4',
    phone: '+1 (555) 015-3321',
    joinedDate: '2024-09-01'
  }
];

// Initial Tasks Dataset
export const initialTasks = [
  {
    id: 'tsk-101',
    title: 'NAAC Accreditation Module Verification',
    description: 'Ensure all department course outcomes and faculty research certificates are uploaded and audited for NAAC review.',
    category: 'Subject Assignment',
    priority: 'High',
    deadline: '2026-08-15',
    created_by: 'u-1', // Admin
    assigned_to: 'u-2', // Prof. Sarah Jenkins
    assigned_to_name: 'Prof. Sarah Jenkins',
    assigned_to_role: 'staff',
    status: 'In Progress',
    parent_task_id: null,
    createdAt: '2026-07-20'
  },
  {
    id: 'tsk-102',
    title: 'Cloud Computing Certification Verification',
    description: 'VerifyAWS / GCP Cloud Practitioner completion certificates submitted by 3rd year CS students.',
    category: 'Course Completion',
    priority: 'Medium',
    deadline: '2026-08-10',
    created_by: 'u-2', // Staff
    assigned_to: 'u-5', // Alex Rivera
    assigned_to_name: 'Alex Rivera',
    assigned_to_role: 'student',
    status: 'Pending',
    parent_task_id: 'tsk-101',
    createdAt: '2026-07-22'
  },
  {
    id: 'tsk-103',
    title: 'Algorithm Design Project Submission',
    description: 'Submit final report and GitHub proof link for the Graph Algorithms assignment.',
    category: 'Subject Assignment',
    priority: 'High',
    deadline: '2026-08-05',
    created_by: 'u-2', // Staff
    assigned_to: 'u-6', // Sophia Martinez
    assigned_to_name: 'Sophia Martinez',
    assigned_to_role: 'student',
    status: 'In Progress',
    parent_task_id: 'tsk-101',
    createdAt: '2026-07-24'
  },
  {
    id: 'tsk-104',
    title: 'Department Monthly Staff Meeting & Action Items',
    description: 'Prepare monthly report on student attendance and low-performing candidates for administrative review.',
    category: 'Monthly Meeting',
    priority: 'Medium',
    deadline: '2026-07-28', // Past date -> Overdue
    created_by: 'u-1',
    assigned_to: 'u-3', // Dr. Robert Chen
    assigned_to_name: 'Dr. Robert Chen',
    assigned_to_role: 'staff',
    status: 'Overdue',
    parent_task_id: null,
    createdAt: '2026-07-10'
  },
  {
    id: 'tsk-105',
    title: 'AI Summit Event Attendance Verification',
    description: 'Collect participation certificates and proof of attendance for National AI Conference 2026.',
    category: 'Event Attendance',
    priority: 'Low',
    deadline: '2026-08-20',
    created_by: 'u-3',
    assigned_to: 'u-7', // David Kim
    assigned_to_name: 'David Kim',
    assigned_to_role: 'student',
    status: 'Completed',
    parent_task_id: 'tsk-104',
    createdAt: '2026-07-18'
  },
  {
    id: 'tsk-106',
    title: 'Embedded Systems Lab Manual Review',
    description: 'Update the EE-302 laboratory manual with new micro-controller syllabus experiments.',
    category: 'Subject Assignment',
    priority: 'High',
    deadline: '2026-08-12',
    created_by: 'u-1',
    assigned_to: 'u-4', // Prof. Elena Rostova
    assigned_to_name: 'Prof. Elena Rostova',
    assigned_to_role: 'staff',
    status: 'Rejected',
    parent_task_id: null,
    createdAt: '2026-07-15'
  }
];

// Initial Submissions Dataset
export const initialSubmissions = [
  {
    id: 'sub-301',
    task_id: 'tsk-105',
    task_title: 'AI Summit Event Attendance Verification',
    submitted_by: 'u-7',
    submitted_by_name: 'David Kim',
    file_name: 'AI_Summit_Certificate_DavidKim.pdf',
    file_url: '#',
    file_size: '2.4 MB',
    submitted_at: '2026-07-25 14:30',
    status: 'Approved',
    review_remarks: 'Verified certificate against registration roster. Excellent work.',
    reviewed_by: 'Dr. Robert Chen',
    reviewed_at: '2026-07-26 10:15'
  },
  {
    id: 'sub-302',
    task_id: 'tsk-103',
    task_title: 'Algorithm Design Project Submission',
    submitted_by: 'u-6',
    submitted_by_name: 'Sophia Martinez',
    file_name: 'Graph_Algorithms_Final_Report.pdf',
    file_url: '#',
    file_size: '4.1 MB',
    submitted_at: '2026-07-30 09:15',
    status: 'Pending',
    review_remarks: '',
    reviewed_by: '',
    reviewed_at: ''
  },
  {
    id: 'sub-303',
    task_id: 'tsk-106',
    task_title: 'Embedded Systems Lab Manual Review',
    submitted_by: 'u-8',
    submitted_by_name: 'Emily Watson',
    file_name: 'EE302_Draft_Manual_v1.docx',
    file_url: '#',
    file_size: '1.8 MB',
    submitted_at: '2026-07-27 16:45',
    status: 'Rejected',
    review_remarks: 'Missing experiment section on ARM Cortex-M architecture. Please revise and resubmit.',
    reviewed_by: 'Prof. Elena Rostova',
    reviewed_at: '2026-07-28 11:20'
  }
];

// Initial Notifications Dataset
export const initialNotifications = [
  {
    id: 'notif-1',
    user_id: 'u-2',
    type: 'Task Assigned',
    title: 'New Admin Task Assigned',
    message: 'Dr. Arthur Pendelton assigned "NAAC Accreditation Module Verification" to you.',
    sent_at: '2026-07-20 09:00',
    read_status: false
  },
  {
    id: 'notif-2',
    user_id: 'u-5',
    type: 'Deadline Reminder',
    title: 'Approaching Deadline Warning',
    message: 'Task "Cloud Computing Certification Verification" is due in 10 days.',
    sent_at: '2026-07-31 08:00',
    read_status: false
  },
  {
    id: 'notif-3',
    user_id: 'u-7',
    type: 'Submission Approved',
    title: 'Submission Approved!',
    message: 'Your submission for "AI Summit Event Attendance Verification" was approved by Dr. Robert Chen.',
    sent_at: '2026-07-26 10:15',
    read_status: true
  },
  {
    id: 'notif-4',
    user_id: 'u-8',
    type: 'Submission Rejected',
    title: 'Submission Needs Revision',
    message: 'Prof. Elena Rostova requested resubmission for "Embedded Systems Lab Manual Review".',
    sent_at: '2026-07-28 11:20',
    read_status: false
  },
  {
    id: 'notif-5',
    user_id: 'u-1',
    type: 'Query Escalation',
    title: 'New Query from Staff',
    message: 'Prof. Sarah Jenkins raised a query regarding NAAC guideline clarification.',
    sent_at: '2026-07-29 15:40',
    read_status: false
  }
];

// Initial Queries / Escalation Dataset
export const initialQueries = [
  {
    id: 'q-1',
    raised_by: 'u-2', // Prof. Sarah Jenkins
    raised_by_name: 'Prof. Sarah Jenkins',
    raised_to: 'u-1', // Admin
    task_id: 'tsk-101',
    task_title: 'NAAC Accreditation Module Verification',
    subject: 'Clarification on NAAC Criteria 3 Research Paper Format',
    message: 'Should we include co-authored international journal papers from visiting faculty in Criteria 3?',
    status: 'Responded',
    created_at: '2026-07-29 15:40',
    responses: [
      {
        sender: 'Dr. Arthur Pendelton',
        sender_role: 'admin',
        message: 'Yes, provided the primary affiliation reflects our institution for the current academic year.',
        timestamp: '2026-07-30 10:00'
      }
    ]
  },
  {
    id: 'q-2',
    raised_by: 'u-3', // Dr. Robert Chen
    raised_to: 'u-1',
    task_id: 'tsk-104',
    task_title: 'Department Monthly Staff Meeting & Action Items',
    subject: 'Extension Request for Monthly Report',
    message: 'Requesting a 3-day extension due to ongoing midterm evaluation schedules.',
    status: 'Open',
    created_at: '2026-07-31 09:15',
    responses: []
  }
];

// Initial Audit Logs Dataset
export const initialAuditLogs = [
  {
    id: 'log-1',
    user_name: 'Dr. Arthur Pendelton',
    action: 'Task Creation',
    entity_type: 'Task',
    entity_id: 'tsk-101',
    details: 'Created task "NAAC Accreditation Module Verification" assigned to Prof. Sarah Jenkins.',
    timestamp: '2026-07-20 09:00:12'
  },
  {
    id: 'log-2',
    user_name: 'Prof. Sarah Jenkins',
    action: 'Task Delegation',
    entity_type: 'Task',
    entity_id: 'tsk-102',
    details: 'Delegated child task "Cloud Computing Certification Verification" to Alex Rivera.',
    timestamp: '2026-07-22 11:14:05'
  },
  {
    id: 'log-3',
    user_name: 'David Kim',
    action: 'Proof Submission',
    entity_type: 'Submission',
    entity_id: 'sub-301',
    details: 'Uploaded proof document "AI_Summit_Certificate_DavidKim.pdf".',
    timestamp: '2026-07-25 14:30:22'
  },
  {
    id: 'log-4',
    user_name: 'Dr. Robert Chen',
    action: 'Submission Review',
    entity_type: 'Submission',
    entity_id: 'sub-301',
    details: 'Marked submission sub-301 as Approved.',
    timestamp: '2026-07-26 10:15:40'
  }
];
