# Internal Task Hub (Next.js 14 + Firebase PWA)

A single-tenant internal company PWA for task management. Built with Next.js 14 (App Router), TypeScript, Tailwind, and Firebase (Auth + Firestore + Storage).

## Features
- Email/password authentication.
- Roles: **admin**, **driver**, **staff**.
- Admin-only dashboard for managing users and tasks.
- Task list, detail view, status updates, notes, and attachments.
- PWA support with offline fallback and Add to Home Screen.

## Project Structure
```
app/
  api/
    session/
    users/
  admin/
  login/
  tasks/
    [id]/
  profile/
  offline/
components/
lib/
  auth/
  firebase/
  hooks/
public/
  manifest.json
  icons/
```

## Firebase Setup
1. Create a Firebase project.
2. Enable **Authentication → Email/Password**.
3. Create **Cloud Firestore** and **Storage**.
4. Create a **Web App** and copy the config values for `NEXT_PUBLIC_*`.
5. Create a **Service Account** (Project Settings → Service accounts) and copy:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (replace newlines with `\n` in `.env`)
6. Update Firestore and Storage rules:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

## Environment Variables
Copy `.env.example` to `.env.local` and fill values:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_STORAGE_BUCKET=

ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME=
```

## Creating the First Admin
Run the seed script once after setting env vars:
```bash
npm run seed:admin
```
This creates a Firebase Auth user and a matching Firestore `users` document with the `admin` role.

## Running Locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Deploying
### Vercel
1. Push to GitHub and import the repo in Vercel.
2. Add the environment variables from `.env.example`.
3. Deploy.

### Firebase Hosting (with Next.js)
Use Firebase's Next.js integration (requires the Firebase CLI):
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## Security Rules
- Firestore rules are in `firestore.rules`.
- Storage rules are in `storage.rules`.

## Notes
- `/admin` requires a server-side role check. Non-admins are redirected to `/login`.
- Client-side guards prevent unauthenticated access to protected routes.
- Middleware requires a session cookie set by `/api/session`.
