import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getAuthUserById } from "@/lib/data";

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await getAuthUserById(session.userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
    },
  });
}
