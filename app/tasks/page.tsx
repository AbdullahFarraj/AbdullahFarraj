'use client';

import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase/client';
import { useUserProfile } from '@/lib/hooks/useUserProfile';

type Task = {
  id: string;
  title: string;
  description: string;
  assignedToUid: string;
  status: 'open' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
};

export default function TasksPage() {
  const { profile, loading: profileLoading } = useUserProfile();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!profile) {
        return;
      }
      setLoading(true);
      const baseQuery = collection(db, 'tasks');
      const constraints = [orderBy('createdAt', 'desc')];
      if (profile.role !== 'admin') {
        constraints.unshift(where('assignedToUid', '==', profile.uid));
      }
      const snapshot = await getDocs(query(baseQuery, ...constraints));
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Task, 'id'>)
      }));
      setTasks(data);
      setLoading(false);
    };

    fetchTasks();
  }, [profile]);

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') {
      return tasks;
    }
    return tasks.filter((task) => task.status === statusFilter);
  }, [tasks, statusFilter]);

  if (profileLoading || loading) {
    return <p className="text-sm text-slate-500">Loading tasks...</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-slate-500">Track assignments and updates.</p>
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="text-sm"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="blocked">Blocked</option>
          <option value="completed">Completed</option>
        </select>
      </header>

      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <Link
            key={task.id}
            href={`/tasks/${task.id}`}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{task.title}</h2>
                <p className="text-sm text-slate-500">Due {task.dueDate || 'No due date'}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {task.status.replace('_', ' ')}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{task.description}</p>
          </Link>
        ))}
        {!filteredTasks.length && (
          <p className="text-sm text-slate-500">No tasks match this filter.</p>
        )}
      </div>
    </div>
  );
}
