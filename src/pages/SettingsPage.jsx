import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Input';
import StatusBadge from '../components/common/StatusBadge';
import { MessageSquarePlus, Send, ShieldAlert, ClipboardList, History } from 'lucide-react';

const SettingsPage = () => {
  const { queries, auditLogs, raiseQuery, respondToQuery, tasks } = useTask();
  const { currentUser, activeRole } = useAuth();

  const [queryForm, setQueryForm] = useState({ task_id: '', subject: '', message: '' });
  const [responseText, setResponseText] = useState({});
  const [activeSection, setActiveSection] = useState('queries');

  const handleRaiseQuery = (e) => {
    e.preventDefault();
    if (!queryForm.subject.trim() || !queryForm.message.trim()) return;
    raiseQuery(queryForm, currentUser);
    setQueryForm({ task_id: '', subject: '', message: '' });
  };

  const handleRespond = (queryId) => {
    if (!responseText[queryId]?.trim()) return;
    respondToQuery(queryId, responseText[queryId], currentUser);
    setResponseText(prev => ({ ...prev, [queryId]: '' }));
  };

  const sectionTabs = [
    { id: 'queries', label: 'Query Escalations', icon: MessageSquarePlus },
    { id: 'audit', label: 'Audit Log', icon: History }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">Settings & Support</h1>
        <p className="text-xs text-slate-500 mt-0.5">Raise escalation queries to admin and review the system audit trail.</p>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
        {sectionTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSection === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeSection === 'queries' && (
        <div className="space-y-6">
          {/* Raise Query Form (Staff only) */}
          {activeRole === 'staff' && (
            <Card title="Raise New Query to Admin" subtitle="Escalate task-related clarifications or operational issues" icon={ShieldAlert}>
              <form onSubmit={handleRaiseQuery} className="space-y-4 mt-2">
                <Select
                  label="Related Task (Optional)"
                  value={queryForm.task_id}
                  onChange={e => setQueryForm(p => ({ ...p, task_id: e.target.value }))}
                  options={[
                    { label: '-- General Query (No Task) --', value: '' },
                    ...tasks.filter(t => t.assigned_to === currentUser.id || t.created_by === currentUser.id)
                      .map(t => ({ label: t.title, value: t.id }))
                  ]}
                />
                <Input
                  label="Query Subject"
                  placeholder="e.g. Clarification on NAAC Criteria 3 guidelines"
                  value={queryForm.subject}
                  onChange={e => setQueryForm(p => ({ ...p, subject: e.target.value }))}
                  required
                />
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Detailed Message</label>
                  <textarea
                    rows="3"
                    placeholder="Explain the issue or clarification required in detail..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                    value={queryForm.message}
                    onChange={e => setQueryForm(p => ({ ...p, message: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" icon={Send}>Submit Query</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Query List */}
          <Card title="Escalation Queue" subtitle="All raised queries and admin responses">
            <div className="space-y-4 mt-2">
              {queries.length > 0 ? queries.map(q => (
                <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <p className="text-xs font-black text-slate-900">{q.subject}</p>
                      <p className="text-[11px] text-slate-500">by {q.raised_by_name} · {q.created_at}</p>
                      {q.task_title && (
                        <p className="text-[11px] text-blue-600 font-medium mt-0.5">📌 Task: {q.task_title}</p>
                      )}
                    </div>
                    <StatusBadge status={q.status} />
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100 mb-3">
                    <p className="text-xs text-slate-700 leading-relaxed">{q.message}</p>
                  </div>

                  {/* Responses Thread */}
                  {q.responses.length > 0 && (
                    <div className="space-y-2 mb-3 ml-4 border-l-2 border-blue-200 pl-3">
                      {q.responses.map((r, i) => (
                        <div key={i} className="p-2.5 bg-blue-50 rounded-xl">
                          <p className="text-[10px] font-bold text-blue-600 uppercase">{r.sender} ({r.sender_role})</p>
                          <p className="text-xs text-slate-700 mt-0.5">{r.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{r.timestamp}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Admin Response Box */}
                  {activeRole === 'admin' && q.status === 'Open' && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Type admin response..."
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                        value={responseText[q.id] || ''}
                        onChange={e => setResponseText(p => ({ ...p, [q.id]: e.target.value }))}
                      />
                      <Button size="sm" variant="primary" icon={Send} onClick={() => handleRespond(q.id)}>
                        Respond
                      </Button>
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-sm text-slate-500 text-center py-6">No escalation queries at this time.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeSection === 'audit' && (
        <Card title="System Audit Log" subtitle="Immutable record of all task and user system actions" icon={ClipboardList}>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th className="px-3 py-3">Timestamp</th>
                  <th className="px-3 py-3">User</th>
                  <th className="px-3 py-3">Action</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-3 whitespace-nowrap text-slate-500">{log.timestamp}</td>
                    <td className="px-3 py-3 font-bold text-slate-800 whitespace-nowrap">{log.user_name}</td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold whitespace-nowrap">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{log.entity_type}</td>
                    <td className="px-3 py-3 text-slate-600 max-w-xs">
                      <span className="line-clamp-2">{log.details}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
