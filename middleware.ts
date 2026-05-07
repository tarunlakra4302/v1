import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
    const sessionCookie = getSessionCookie(request);
    const isAction = request.headers.has("Next-Action");
    const isDataRequest = request.headers.has("Next-Router-State-Tree") || request.nextUrl.pathname.startsWith('/_next/data');

    if (!sessionCookie) {
        // Prevent redirecting Server Actions and data requests to HTML pages, 
        // which causes "An unexpected response was received from the server" error.
        if (isAction || isDataRequest) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up|assets).*)',
    ],
};
