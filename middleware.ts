import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_COOKIE_NAME = 'authToken'; // Name of the cookie storing the JWT

// Define public paths that should not require authentication
const publicPaths = [
  '/', // Landing page
  '/auth/login',
  '/auth/signup',
  '/launching-soon',
  '/maintenance',
  // Add any other public static pages like /terms, /privacy if they exist at root
];

// Define paths that should be considered part of the authenticated app
// This helps differentiate from other root-level pages that might be public
const appPathsPrefix = '/(app)/'; // This is a convention, Next.js (app) router groups are not part of URL

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public or an internal Next.js asset
  const isPublicPath = publicPaths.includes(pathname) ||
                       pathname.startsWith('/_next/') ||
                       pathname.startsWith('/api/') || // API routes might have their own auth
                       pathname.includes('.'); // Typically files like .png, .ico

  if (isPublicPath) {
    return NextResponse.next();
  }

  // For all other paths, assume they require authentication
  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    // Redirect to login if no token and path is protected
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Optional: redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not set. Authentication checks will be skipped.');
    // In a real production scenario, you might want to return an error or redirect
    // For now, in dev, we might allow if JWT_SECRET is missing, with a warning.
    // Or, more strictly:
    // const loginUrl = new URL('/auth/login', request.url);
    // loginUrl.searchParams.set('error', 'auth_config_error');
    // return NextResponse.redirect(loginUrl);
    return NextResponse.next(); // For now, allow if secret is missing in dev for easier setup
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    // Token is valid, proceed
    return NextResponse.next();
  } catch (error) {
    // Token verification failed (expired, invalid, etc.)
    console.error('JWT verification failed:', error);
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    // Clear the invalid cookie
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(TOKEN_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    // Match all request paths except for API routes, Next.js static files,
    // Next.js image optimization files, and files with extensions (e.g. .ico, .png)
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    '/', // Ensure root is also matched if not explicitly public
  ],
};
