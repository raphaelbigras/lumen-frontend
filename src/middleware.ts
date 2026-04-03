import { auth } from '@/lib/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow auth API routes and static assets
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return;
  }

  // Redirect unauthenticated users to sign in
  if (!req.auth) {
    const signInUrl = new URL('/api/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
