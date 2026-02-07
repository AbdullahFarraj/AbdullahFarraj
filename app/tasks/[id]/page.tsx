'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  orderBy,
  query,
  updateDoc,
  getDocs,
  where
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/client';
import { useUserProfile } from '@/lib/hooks/useUserProfile';

type Task = {
  title: string;
  description: string;
  assignedToUid: string;
  status: 'open' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

type Update = {
  id: string;
  note: string;
  statusChange: string;
  createdAt: string;
  attachmentUrl?: string;
};

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params?.id as string;
  const { profile } = useUserProfile();
  const [task, setTask] = useState<Task | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<Task['status']>('open');
  const [attachment, setAttachment] = useState<File | null>(null);

  const loadTask = async () => {
    const snapshot = await getDoc(doc(db, 'tasks', taskId));
    if (snapshot.exists()) {
      const data = snapshot.data() as Task;
      setTask(data);
      setStatus(data.status);
    }
  };

  const loadUpdates = async () => {
    const snapshot = await getDocs(
      query(
        collection(db, 'taskUpdates'),
        where('taskId', '==', taskId),
        orderBy('createdAt', 'desc')
      )
    );
    const data = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Update, 'id'>)
    }));
    setUpdates(data);
  };

  useEffect(() => {
    if (taskId) {
      loadTask();
      loadUpdates();
    }
  }, [taskId]);

  const handleUpdate = async () => {
    if (!profile) {
      return;
    }
    let attachmentUrl = '';
    if (attachment) {
      const storageRef = ref(storage, `tasks/${taskId}/${attachment.name}`);
      await uploadBytes(storageRef, attachment);
      attachmentUrl = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, 'tasks', taskId), {
      status,
      updatedAt: new Date().toISOString()
    });

    await addDoc(collection(db, 'taskUpdates'), {
      taskId,
      byUid: profile.uid,
      note,
      statusChange: status,
      attachmentUrl,
      createdAt: new Date().toISOString()
    });

    setNote('');
    setAttachment(null);
    loadTask();
    loadUpdates();
  };

  if (!task) {
    return <p className="text-sm text-slate-500">Loading task...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{task.description}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
          <span>Status: {task.status.replace('_', ' ')}</span>
          <span>Priority: {task.priority}</span>
          <span>Due: {task.dueDate || 'None'}</span>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Update task</h2>
        <div className="grid gap-3">
          <select value={status} onChange={(event) => setStatus(event.target.value as Task['status'])}>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
          </select>
          <textarea
            placeholder="Add a note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <input type="file" onChange={(event) => setAttachment(event.target.files?.[0] ?? null)} />
          <button className="bg-brand-600 text-white" onClick={handleUpdate}>
            Save update
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Updates</h2>
        <ul className="space-y-4">
          {updates.map((update) => (
            <li key={update.id} className="rounded-md border border-slate-200 p-4">
              <p className="text-sm text-slate-700">{update.note || 'No note provided.'}</p>
              <p className="mt-2 text-xs text-slate-500">Status: {update.statusChange}</p>
              {update.attachmentUrl && (
                <a
                  href={update.attachmentUrl}
                  className="mt-2 inline-block text-xs text-brand-600"
                  target="_blank"
                  rel="noreferrer"
                >
                  View attachment
                </a>
              )}
            </li>
          ))}
          {!updates.length && <p className="text-sm text-slate-500">No updates yet.</p>}
        </ul>
      </div>
    </div>
  );
}
