import { serverFetch } from '@/lib/api/server-client';
import { CustomFieldsClient } from './CustomFieldsClient';

interface CategoriesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const params = await searchParams;
  const tab = String(params.tab || 'categories');

  const [categories, departments] = await Promise.all([
    serverFetch<any[]>('/categories'),
    serverFetch<any[]>('/departments'),
  ]);

  return (
    <CustomFieldsClient
      categories={categories}
      departments={departments}
      initialTab={tab}
    />
  );
}
