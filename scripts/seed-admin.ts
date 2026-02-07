import { adminAuth, adminDb } from '../lib/firebase/admin';

async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin User';

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');
  }

  let userRecord;

  try {
    userRecord = await adminAuth.getUserByEmail(email);
  } catch {
    userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name
    });
  }

  await adminDb.collection('users').doc(userRecord.uid).set({
    uid: userRecord.uid,
    name,
    email,
    phone: '',
    role: 'admin',
    active: true,
    createdAt: new Date().toISOString()
  });

  console.log(`Admin ready: ${userRecord.uid}`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
