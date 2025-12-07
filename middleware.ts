import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Auth is handled client-side via Redux + localStorage
  // Server-side middleware doesn't have access to localStorage
  // Client-side route protection is handled by Redux state

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
