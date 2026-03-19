import { NextResponse } from "next/server";
import { addComplaint, getComplaints } from "@/lib/data";

type ComplaintBody = {
  projectId?: string;
  text?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  return NextResponse.json(getComplaints(projectId));
}

export async function POST(request: Request) {
  const body = (await request.json()) as ComplaintBody;
  if (!body.projectId || !body.text) {
    return NextResponse.json({ error: "projectId and text are required" }, { status: 400 });
  }

  const complaint = addComplaint(body.projectId, body.text);
  return NextResponse.json(complaint, { status: 201 });
}
