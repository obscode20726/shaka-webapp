import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Proxy API requests to backend with cookie-based auth
  if (apiUrl && request.nextUrl.pathname.startsWith('/api/proxy/')) {
    // Remove /api/proxy prefix to get the actual backend endpoint
    const backendPath = request.nextUrl.pathname.replace('/api/proxy', '');
    const backendUrl = `${apiUrl}${backendPath}${request.nextUrl.search}`;

    // Prepare headers
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });

    // Add Authorization header from HttpOnly cookie
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Proxy the request to the backend
    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : undefined,
    });

    // Return the backend response
    const data = await response.text();
    const proxyResponse = new NextResponse(data, {
      status: response.status,
      headers: response.headers,
    });

    return proxyResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all pathnames except for static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
