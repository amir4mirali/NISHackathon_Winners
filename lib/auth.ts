import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { AuthUser, UserRole } from "@/lib/data";

export type SessionPayload = {
  userId: string;
  role: UserRole;
  email: string;
  name: string;
  exp: number;
};

export const SESSION_COOKIE_NAME = "alatau_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getAuthSecret(): string {
  return process.env.AUTH_SECRET || "dev-only-change-this-secret";
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(value: string): string {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function secureEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function parseCookieHeader(request: Request): Record<string, string> {
  const raw = request.headers.get("cookie");
  if (!raw) return {};

  return raw.split(";").reduce<Record<string, string>>((acc, part) => {
    const [name, ...rest] = part.trim().split("=");
    if (!name) return acc;
    acc[name] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

export function createSessionToken(user: AuthUser): string {
  const payload: SessionPayload = {
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function getSessionFromRequest(request: Request): SessionPayload | null {
  const cookies = parseCookieHeader(request);
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signValue(encodedPayload);
  if (!secureEqual(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (!payload.userId || !payload.role || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
