import { NextResponse } from "next/server";
import { createProject, getProjects, Project } from "@/lib/data";

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Omit<Project, "id" | "developerName">;

  if (!body.name || !body.district || !body.type || !body.status || !body.developerId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const project = await createProject(body);
  return NextResponse.json(project, { status: 201 });
}
