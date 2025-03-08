import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// This middleware protects specific routes
export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define paths that are protected
  const protectedPaths = [
    "/subjects",
    "/student-lists",
    "/profile",
    "/api/subjects",
    "/api/addNew",
    "/api/ItemById",
    "/api/programOutcomes"
  ];

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // For API routes not in protected paths, we'll let the route handler manage authentication
  if (path.startsWith("/api/") && !isProtectedPath) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If user is not authenticated and trying to access a protected route,
  // redirect to the home page with an auth parameter
  if (!token && isProtectedPath) {
    const url = new URL("/", request.url);
    url.searchParams.set("auth", "required");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure paths to match
export const config = {
  matcher: [
    "/subjects/:path*",
    "/student-lists/:path*",
    "/profile/:path*",
    "/api/addNew/:path*",
    "/api/ItemById/:path*",
    "/api/programOutcomes/:path*"
  ],
};