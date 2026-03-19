"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRole } from "@/components/RoleProvider";
import { Project, ProjectStatus } from "@/lib/data";

const statuses: ProjectStatus[] = ["planned", "in progress", "completed"];

export default function DeveloperDashboardPage() {
  const { role, currentUser } = useRole();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/projects", { cache: "no-store" })
      .then((response) => response.json() as Promise<Project[]>)
      .then((data) => {
        if (active) {
          setProjects(data);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const assignedProjects = useMemo(
    () => projects.filter((project) => project.developerId === currentUser.id),
    [projects, currentUser.id],
  );

  const updateStatus = async (projectId: string, status: ProjectStatus) => {
    await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setProjects((prev) =>
      prev.map((project) => (project.id === projectId ? { ...project, status } : project)),
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <header className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Developer Panel</h1>
            <p className="text-sm text-[color:var(--muted)]">
              Logged in as {currentUser.name}. Manage only your assigned projects.
            </p>
          </div>
          <Link href="/platform" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
            Back to Map
          </Link>
        </div>
      </header>

      {role !== "developer" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Switch role to Developer on the main page to use this panel.
        </div>
      ) : (
        <section className="space-y-3">
          {assignedProjects.length === 0 && (
            <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow">No assigned projects.</div>
          )}

          {assignedProjects.map((project) => (
            <article key={project.id} className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <p className="text-sm text-[color:var(--muted)]">
                    {project.district} · {project.type}
                  </p>
                </div>
                <select
                  value={project.status}
                  onChange={(event) =>
                    updateStatus(project.id, event.target.value as ProjectStatus)
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
