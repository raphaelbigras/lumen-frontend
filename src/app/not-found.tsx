import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-lumen-bg-primary flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-lumen-text-primary mb-2">404</h1>
        <p className="text-lumen-text-secondary mb-6">Page introuvable</p>
        <Link
          href="/dashboard"
          className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
