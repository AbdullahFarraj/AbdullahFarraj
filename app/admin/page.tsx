'use client';

import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, getDocs, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useUserProfile } from '@/lib/hooks/useUserProfile';

type User = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'driver' | 'staff';
  active: boolean;
};

type TaskForm = {
  title: string;
  description: string;
  assignedToUid: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
};

type UserForm = {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'driver' | 'staff';
  password: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useUserProfile();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskForm>({
    title: '',
    description: '',
    assignedToUid: '',
    priority: 'medium',
    dueDate: ''
  });
  const [userForm, setUserForm] = useState<UserForm>({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    password: ''
  });
  const [userMessage, setUserMessage] = useState('');

  const activeUsers = useMemo(() => users.filter((user) => user.active), [users]);

  const loadUsers = async () => {
    setLoading(true);
    const snapshot = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
    const data = snapshot.docs.map((docSnap) => docSnap.data() as User);
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleActive = async (user: User) => {
    await updateDoc(doc(db, 'users', user.uid), { active: !user.active });
    loadUsers();
  };

  const handleCreateTask = async () => {
    if (!profile || !taskForm.title || !taskForm.assignedToUid) {
      return;
    }
    await addDoc(collection(db, 'tasks'), {
      title: taskForm.title,
      description: taskForm.description,
      assignedToUid: taskForm.assignedToUid,
      status: 'open',
      priority: taskForm.priority,
      dueDate: taskForm.dueDate,
      createdByUid: profile.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setShowTaskModal(false);
    setTaskForm({
      title: '',
      description: '',
      assignedToUid: '',
      priority: 'medium',
      dueDate: ''
    });
  };

  const handleCreateUser = async () => {
    setUserMessage('');
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm)
    });

    if (response.ok) {
      setUserMessage('User created.');
      setUserForm({ name: '', email: '', phone: '', role: 'staff', password: '' });
      loadUsers();
    } else {
      const data = await response.json();
      setUserMessage(data.error ?? 'Unable to create user.');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Manage users and assign tasks.</p>
        </div>
        <button
          className="bg-brand-600 text-white hover:bg-brand-500"
          onClick={() => setShowTaskModal(true)}
        >
          Create Task
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Create User</h2>
          <div className="grid gap-3">
            <input
              placeholder="Full name"
              value={userForm.name}
              onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
            />
            <input
              placeholder="Email"
              type="email"
              value={userForm.email}
              onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
            />
            <input
              placeholder="Phone"
              value={userForm.phone}
              onChange={(event) => setUserForm({ ...userForm, phone: event.target.value })}
            />
            <select
              value={userForm.role}
              onChange={(event) =>
                setUserForm({
                  ...userForm,
                  role: event.target.value as UserForm['role']
                })
              }
            >
              <option value="admin">Admin</option>
              <option value="driver">Driver</option>
              <option value="staff">Staff</option>
            </select>
            <input
              placeholder="Temporary password"
              type="password"
              value={userForm.password}
              onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
            />
            <button className="bg-slate-900 text-white" onClick={handleCreateUser}>
              Add User
            </button>
            {userMessage && <p className="text-sm text-slate-600">{userMessage}</p>}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Active Users</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading users...</p>
          ) : (
            <ul className="space-y-3">
              {activeUsers.map((user) => (
                <li key={user.uid} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email} · {user.role}</p>
                  </div>
                  <button
                    className="border border-slate-300 text-sm text-slate-700"
                    onClick={() => toggleActive(user)}
                  >
                    {user.active ? 'Deactivate' : 'Activate'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {showTaskModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Create Task</h2>
            <div className="grid gap-3">
              <input
                placeholder="Title"
                value={taskForm.title}
                onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
              />
              <textarea
                placeholder="Description"
                value={taskForm.description}
                onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
              />
              <select
                value={taskForm.assignedToUid}
                onChange={(event) => setTaskForm({ ...taskForm, assignedToUid: event.target.value })}
              >
                <option value="">Assign to user</option>
                {activeUsers.map((user) => (
                  <option key={user.uid} value={user.uid}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
              <select
                value={taskForm.priority}
                onChange={(event) =>
                  setTaskForm({
                    ...taskForm,
                    priority: event.target.value as TaskForm['priority']
                  })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })}
              />
              <div className="flex justify-end gap-2">
                <button className="border border-slate-300" onClick={() => setShowTaskModal(false)}>
                  Cancel
                </button>
                <button className="bg-brand-600 text-white" onClick={handleCreateTask}>
                  Save Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
