'use client';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { initialized, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && user) {
      router.replace('/dashboard');
    }
  }, [initialized, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-lumen-bg-primary">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
