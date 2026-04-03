import { serverFetch } from '@/lib/api/server-client';
import { CreateTicketForm } from './CreateTicketForm';

export default async function NouveauBilletPage() {
  const [categories, departments] = await Promise.all([
    serverFetch<{ id: string; name: string }[]>('/categories'),
    serverFetch<{ id: string; name: string }[]>('/departments'),
  ]);

  return (
    <CreateTicketForm
      categories={categories}
      departments={departments}
    />
  );
}
