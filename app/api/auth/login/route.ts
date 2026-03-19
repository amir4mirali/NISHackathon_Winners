import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/data";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Укажите почту и пароль" }, { status: 400 });
  }

  const user = await authenticateUser(body.email, body.password);
  if (!user) {
    return NextResponse.json({ error: "Неверная почта или пароль" }, { status: 401 });
  }

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
    },
  });

  const token = createSessionToken(user);
  setSessionCookie(response, token);

  return response;
}
