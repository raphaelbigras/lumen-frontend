import { auth } from '@/lib/auth';
import { AppShell } from '../../components/AppShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <AppShell
      userRole={session?.user?.role || 'USER'}
      userName={session?.user?.name || ''}
    >
      {children}
    </AppShell>
  );
}
