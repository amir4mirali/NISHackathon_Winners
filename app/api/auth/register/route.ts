import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { registerResident } from "@/lib/data";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;

  if (!body.name || !body.email || !body.password) {
    return NextResponse.json(
      { error: "name, email and password are required" },
      { status: 400 },
    );
  }

  const result = await registerResident(body.name, body.email, body.password);
  if (!result.user) {
    return NextResponse.json({ error: result.error ?? "Registration failed" }, { status: 400 });
  }

  const response = NextResponse.json({ user: result.user }, { status: 201 });
  const token = createSessionToken(result.user);
  setSessionCookie(response, token);

  return response;
}
