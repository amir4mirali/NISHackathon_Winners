import { NextResponse } from "next/server";
import { addComplaint, getComplaints } from "@/lib/data";
import { getSessionFromRequest } from "@/lib/auth";

type ComplaintBody = {
  projectId?: string;
  text?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  const complaints = await getComplaints(projectId);
  return NextResponse.json(complaints);
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session || session.role !== "resident") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ComplaintBody;
  if (!body.projectId || !body.text) {
    return NextResponse.json({ error: "projectId and text are required" }, { status: 400 });
  }

  const complaint = await addComplaint(body.projectId, body.text);
  return NextResponse.json(complaint, { status: 201 });
}
