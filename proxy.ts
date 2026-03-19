import { NextRequest, NextResponse } from "next/server";

type UserRole = "resident" | "developer" | "admin";

type SessionPayload = {
  userId: string;
  role: UserRole;
  email: string;
  name: string;
  exp: number;
};

const SESSION_COOKIE_NAME = "alatau_session";
const LOGIN_PATH = "/login";
const REGISTER_PATH = "/register";
const PLATFORM_PATH = "/platform";

function getAuthSecret(): string {
  return process.env.AUTH_SECRET || "dev-only-change-this-secret";
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function signValue(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

async function getSessionFromCookie(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = await signValue(encodedPayload);
  if (signature !== expectedSignature) return null;

  try {
    const payloadJson = new TextDecoder().decode(fromBase64Url(encodedPayload));
    const payload = JSON.parse(payloadJson) as SessionPayload;

    if (!payload.userId || !payload.role || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

function redirectTo(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromCookie(request);

  const isAuthPage = pathname === LOGIN_PATH || pathname === REGISTER_PATH;
  if (isAuthPage && session) {
    return redirectTo(request, PLATFORM_PATH);
  }

  if (pathname.startsWith("/dashboard/admin")) {
    if (!session) {
      return redirectTo(request, LOGIN_PATH);
    }

    if (session.role !== "admin") {
      return redirectTo(request, PLATFORM_PATH);
    }
  }

  if (pathname.startsWith("/dashboard/developer")) {
    if (!session) {
      return redirectTo(request, LOGIN_PATH);
    }

    if (session.role !== "developer") {
      return redirectTo(request, PLATFORM_PATH);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/admin/:path*", "/dashboard/developer/:path*"],
};
