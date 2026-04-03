import { serverFetch } from '@/lib/api/server-client';
import { DepartmentsClient } from './DepartmentsClient';

export default async function DepartmentsPage() {
  const departments = await serverFetch<any[]>('/departments');

  return <DepartmentsClient departments={departments} />;
}
