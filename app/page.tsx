import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function HomePage() {
  const session = cookies().get('session');
  if (session) {
    redirect('/tasks');
  }
  redirect('/login');
}
