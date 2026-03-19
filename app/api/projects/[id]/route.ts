import { NextResponse } from "next/server";
import { deleteProject, getProjectById, updateProject, Project } from "@/lib/data";
import { getSessionFromRequest } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const changes = (await request.json()) as Partial<Omit<Project, "id">>;

  const existing = await getProjectById(id);
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const canEdit =
    session.role === "admin" ||
    (session.role === "developer" && existing.developerId === session.userId);

  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await updateProject(id, changes);
  if (!updated) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = getSessionFromRequest(_);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteProject(id);

  if (!deleted) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
